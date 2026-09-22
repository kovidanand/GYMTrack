import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, AlertTriangle, Check, ExternalLink, Plus, Dumbbell } from 'lucide-react'
import type { StructuredExerciseGuidance, StructuredWorkoutRecommendation } from '@/types'
import { ExerciseVideoPlayer } from '@/components/exercise/ExerciseVideoPlayer'
import { resolveExerciseMedia } from '@/lib/exerciseMedia'
import { useToast } from '@/components/shared/Toast'
import { queueExerciseForTodayWorkout } from '@/lib/offline/db'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import { cn } from '@/lib/utils'

interface AiResponseRendererProps {
  content: string
  imageUrl?: string
  structuredGuidance?: StructuredExerciseGuidance
  structuredRecommendation?: StructuredWorkoutRecommendation
  className?: string
}

// ── Sanitization ───────────────────────────────────────────────────────────

const DECORATIVE_SYMBOLS = /[★☆✦✧✨⭐🌟💪🏋️‍♂️🏋️‍♀️🔥💥⚡🎯🏆🥇🥈🥉✅❌⚠️🔴🟢🟡🔵📊📈📉🎉🎊💯🙌👏🤝💡📌📍🔑]/g

export function stripDecorative(text: string): string {
  return text.replace(DECORATIVE_SYMBOLS, '').trim()
}

export function stripMarkdownInline(text: string): string {
  let result = text.replace(/\*{3}(.+?)\*{3}/g, '$1')
  result = result.replace(/\*{2}(.+?)\*{2}/g, '$1')
  result = result.replace(/\*(.+?)\*/g, '$1')
  result = result.replace(/`([^`]+)`/g, '$1')
  result = stripDecorative(result)
  return result.trim()
}

// ── Line Parsing ───────────────────────────────────────────────────────────

interface ParsedBlock {
  type: 'heading' | 'subheading' | 'body' | 'numbered-list-item' | 'bullet-list-item' | 'separator' | 'table-row' | 'empty' | 'bold-label'
  text: string
  level?: number
  cells?: string[]
}

function parseLine(line: string): ParsedBlock {
  const trimmed = line.trim()
  if (!trimmed) return { type: 'empty', text: '' }

  if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
    return { type: 'separator', text: '' }
  }

  if (trimmed.includes('|')) {
    if (/^\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?\s*$/.test(trimmed)) {
      return { type: 'separator', text: '' }
    }
    const cells = trimmed
      .split('|')
      .map(c => stripMarkdownInline(c.trim()))
      .filter(c => c.length > 0)
    if (cells.length > 0) {
      return { type: 'table-row', text: trimmed, cells }
    }
  }

  const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
  if (headingMatch) {
    const level = headingMatch[1].length
    return {
      type: level <= 2 ? 'heading' : 'subheading',
      text: stripMarkdownInline(headingMatch[2]),
      level
    }
  }

  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
  if (numberedMatch) {
    return { type: 'numbered-list-item', text: stripMarkdownInline(numberedMatch[2]) }
  }

  const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/)
  if (bulletMatch) {
    return { type: 'bullet-list-item', text: stripMarkdownInline(bulletMatch[1]) }
  }

  const boldLabelMatch = trimmed.match(/^\*{2}(.+?)\*{2}:?\s*(.*)$/)
  if (boldLabelMatch && !boldLabelMatch[2]) {
    return { type: 'subheading', text: stripDecorative(boldLabelMatch[1]) }
  }
  if (boldLabelMatch && boldLabelMatch[2]) {
    return { type: 'bold-label', text: stripDecorative(`${boldLabelMatch[1]}: ${boldLabelMatch[2]}`) }
  }

  return { type: 'body', text: stripMarkdownInline(trimmed) }
}

interface RenderGroup {
  type: 'heading' | 'subheading' | 'body' | 'numbered-list' | 'bullet-list' | 'separator' | 'table' | 'bold-label'
  items: ParsedBlock[]
}

function groupBlocks(blocks: ParsedBlock[]): RenderGroup[] {
  const groups: RenderGroup[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]
    if (block.type === 'empty' || block.type === 'separator') {
      i++
      continue
    }

    if (block.type === 'numbered-list-item') {
      const items: ParsedBlock[] = []
      while (i < blocks.length && blocks[i].type === 'numbered-list-item') {
        items.push(blocks[i])
        i++
      }
      groups.push({ type: 'numbered-list', items })
      continue
    }

    if (block.type === 'bullet-list-item') {
      const items: ParsedBlock[] = []
      while (i < blocks.length && blocks[i].type === 'bullet-list-item') {
        items.push(blocks[i])
        i++
      }
      groups.push({ type: 'bullet-list', items })
      continue
    }

    if (block.type === 'table-row') {
      const items: ParsedBlock[] = []
      while (i < blocks.length && blocks[i].type === 'table-row') {
        items.push(blocks[i])
        i++
      }
      groups.push({ type: 'table', items })
      continue
    }

    groups.push({ type: block.type as RenderGroup['type'], items: [block] })
    i++
  }

  return groups
}

// ── Compact Recommended Exercise Card for AI Coach ─────────────────────────

function CompactAiExerciseCard({
  name,
  slug,
  setsReps
}: {
  name: string
  slug: string
  setsReps: string
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const media = resolveExerciseMedia(slug)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el || !media?.videoUrl) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, { threshold: 0.2 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [media?.videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    let isSubscribed = true
    
    if (isVisible) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    } else {
      video.pause()
    }
    
    return () => {
      isSubscribed = false
    }
  }, [isVisible])

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const foundEx = DEFAULT_EXERCISES.find(ex => ex.slug === slug || ex.id === slug)
    const exerciseToQueue = foundEx || {
      id: `ex-${slug}`,
      name,
      slug,
      description: '',
      instructions: [],
      tips: [],
      common_mistakes: [],
      primary_muscle: 'Full Body',
      secondary_muscles: [],
      muscle_group: 'chest',
      equipment: ['barbell'],
      difficulty: 'intermediate',
      exercise_type: 'strength',
      movement_pattern: 'compound',
      is_compound: true,
      is_unilateral: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    queueExerciseForTodayWorkout(exerciseToQueue as any)
    toast.success(
      `${name} added to today's training.`,
      undefined,
      {
        label: 'Log now',
        onClick: () => navigate('/dashboard')
      }
    )
  }

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/exercises/${slug}`)}
      className="flex items-center gap-3 p-2.5 rounded-xl border border-surface-200/80 bg-white hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      {/* Video Thumbnail */}
      <div className="w-16 h-14 rounded-lg overflow-hidden bg-surface-900 flex-shrink-0 relative">
        {media?.videoUrl ? (
          <video
            ref={videoRef}
            src={media.videoUrl}
            poster={media.posterUrl || media.thumbnailUrl}
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : media?.thumbnailUrl ? (
          <img
            src={media.thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-400">
            <Dumbbell size={16} />
          </div>
        )}
      </div>

      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-xs text-surface-900 group-hover:text-brand-600 truncate transition-colors">
            {name}
          </span>
          <ExternalLink size={10} className="text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
        <p className="text-[11px] text-surface-500 font-medium">{setsReps}</p>
      </div>

      {/* Log Exercise Navigation Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/exercises/${slug}`)
        }}
        className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-brand-50 hover:text-brand-700 text-surface-700 text-xs font-bold flex items-center gap-1 border border-surface-200 transition-colors flex-shrink-0"
        title={`Log ${name}`}
        aria-label={`Log ${name}`}
      >
        <Dumbbell size={12} className="text-brand-600" />
        <span>Log</span>
      </button>
    </div>
  )
}

// ── Structured Guidance Renderer ───────────────────────────────────────────

function AiExerciseGuidanceView({ guidance }: { guidance: StructuredExerciseGuidance }) {
  const navigate = useNavigate()
  const toast = useToast()
  const media = guidance.media || resolveExerciseMedia(guidance.exercise.slug || guidance.exercise.name)

  const handleAdd = () => {
    const foundEx = DEFAULT_EXERCISES.find(ex => ex.slug === guidance.exercise.slug || ex.id === guidance.exercise.slug)
    const exerciseToQueue = foundEx || {
      id: `ex-${guidance.exercise.slug}`,
      name: guidance.exercise.name,
      slug: guidance.exercise.slug,
      description: '',
      instructions: guidance.steps,
      tips: [guidance.tip],
      common_mistakes: guidance.mistakes,
      primary_muscle: guidance.targetMuscles[0] || 'Target Muscles',
      secondary_muscles: [],
      muscle_group: 'chest',
      equipment: ['dumbbell'],
      difficulty: 'intermediate',
      exercise_type: 'strength',
      movement_pattern: 'compound',
      is_compound: true,
      is_unilateral: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    queueExerciseForTodayWorkout(exerciseToQueue as any)
    toast.success(
      `${guidance.exercise.name} added to today's training.`,
      undefined,
      {
        label: 'Log now',
        onClick: () => navigate('/dashboard')
      }
    )
  }

  return (
    <div className="space-y-3.5 pt-1 animate-fade-in">
      {/* Title with link to Exercise Detail page */}
      <div className="flex items-center justify-between gap-2 border-b border-surface-100 pb-2">
        <button
          type="button"
          onClick={() => navigate(`/exercises/${guidance.exercise.slug}`)}
          className="text-left group flex items-center gap-1.5"
        >
          <h3 className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
            {guidance.exercise.name}
          </h3>
          <ExternalLink size={12} className="text-surface-400 group-hover:text-brand-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => navigate(`/exercises/${guidance.exercise.slug}`)}
          className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1.5 border border-brand-200 transition-all active:scale-95"
        >
          <Dumbbell size={12} />
          <span>Log Exercise</span>
        </button>
      </div>

      {/* Continuous Real Demonstration Video */}
      <div className="rounded-xl overflow-hidden border border-surface-200 shadow-xs">
        <ExerciseVideoPlayer
          media={media}
          exerciseName={guidance.exercise.name}
          aspectRatio="16/9"
          autoPlay={true}
          showGenderToggle={true}
          objectFit="cover"
        />
      </div>

      {/* Target Muscles */}
      {guidance.targetMuscles && guidance.targetMuscles.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Target Muscles</p>
          <div className="flex flex-wrap gap-1">
            {guidance.targetMuscles.map((m, idx) => (
              <span key={idx} className="badge bg-brand-50 text-brand-700 border border-brand-200 text-[11px]">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How to Perform (Steps) */}
      {guidance.steps && guidance.steps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">How to perform</p>
          <ol className="space-y-1.5 pl-0">
            {guidance.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-surface-700 leading-relaxed">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Common Mistakes */}
      {guidance.mistakes && guidance.mistakes.length > 0 && (
        <div className="space-y-1.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <AlertTriangle size={12} className="text-amber-600" /> Common mistakes
          </p>
          <ul className="space-y-1 pl-0">
            {guidance.mistakes.map((m, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-amber-900 leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coach Tip */}
      {guidance.tip && (
        <div className="p-2.5 rounded-xl bg-brand-50/50 border border-brand-200/60 text-xs text-brand-900 leading-relaxed flex items-start gap-2">
          <Lightbulb size={14} className="text-brand-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold text-brand-800">Coach tip: </span>
            {guidance.tip}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Structured Workout Recommendation Renderer ─────────────────────────────

function AiWorkoutRecommendationView({ rec }: { rec: StructuredWorkoutRecommendation }) {
  return (
    <div className="space-y-3.5 pt-1 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
          TODAY'S RECOMMENDATION
        </span>
        <h3 className="text-base font-bold text-surface-900 mt-1.5 leading-snug">
          {rec.focus}
        </h3>
        <p className="text-xs text-surface-600 mt-1 leading-relaxed">
          {rec.reasoning}
        </p>
      </div>

      {/* Recommended Exercise Video Cards */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
          Recommended exercises
        </p>
        <div className="space-y-2">
          {rec.exercises.map((item, idx) => (
            <CompactAiExerciseCard
              key={idx}
              name={item.name}
              slug={item.slug}
              setsReps={`${item.sets} sets × ${item.reps}`}
            />
          ))}
        </div>
      </div>

      {/* Coach Insight */}
      {rec.coachInsight && (
        <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-700 leading-relaxed">
          <p className="font-bold text-surface-900 mb-0.5">Coach insight</p>
          {rec.coachInsight}
        </div>
      )}
    </div>
  )
}

// ── Main AiResponseRenderer Component ──────────────────────────────────────

export function AiResponseRenderer({
  content,
  imageUrl,
  structuredGuidance,
  structuredRecommendation,
  className = ''
}: AiResponseRendererProps) {
  // If structured guidance is provided, render the rich guidance component
  if (structuredGuidance) {
    return (
      <div className={className}>
        <AiExerciseGuidanceView guidance={structuredGuidance} />
      </div>
    )
  }

  // If structured recommendation is provided, render the rich workout recommendation component
  if (structuredRecommendation) {
    return (
      <div className={className}>
        <AiWorkoutRecommendationView rec={structuredRecommendation} />
      </div>
    )
  }

  if (!content || !content.trim()) {
    return null
  }

  const lines = content.split('\n')
  const blocks = lines.map(parseLine)
  const groups = groupBlocks(blocks)

  return (
    <div className={`space-y-3 ${className}`}>
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-surface-200 bg-surface-50 p-1.5">
          <img
            src={imageUrl}
            alt="Exercise demonstration"
            className="w-full max-h-48 object-contain rounded-lg bg-white"
            loading="lazy"
          />
        </div>
      )}

      {groups.map((group, gi) => {
        switch (group.type) {
          case 'heading':
            return (
              <h3
                key={gi}
                className="text-base font-bold text-surface-900 leading-snug tracking-tight"
              >
                {group.items[0].text}
              </h3>
            )

          case 'subheading':
            return (
              <h4
                key={gi}
                className="text-[14px] font-semibold text-surface-800 leading-snug mt-1"
              >
                {group.items[0].text}
              </h4>
            )

          case 'bold-label': {
            const text = group.items[0].text
            const colonIdx = text.indexOf(':')
            if (colonIdx > 0) {
              const label = text.substring(0, colonIdx)
              const value = text.substring(colonIdx + 1).trim()
              return (
                <div key={gi} className="flex items-baseline gap-1.5 text-sm">
                  <span className="font-semibold text-surface-800">{label}:</span>
                  <span className="text-surface-600">{value}</span>
                </div>
              )
            }
            return (
              <p key={gi} className="text-sm text-surface-700 leading-relaxed">
                {text}
              </p>
            )
          }

          case 'body':
            return (
              <p
                key={gi}
                className="text-sm text-surface-700 leading-relaxed"
              >
                {group.items[0].text}
              </p>
            )

          case 'numbered-list':
            return (
              <ol key={gi} className="space-y-1.5 pl-0">
                {group.items.map((item, ii) => (
                  <li
                    key={ii}
                    className="flex items-start gap-2.5 text-sm text-surface-700 leading-relaxed"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {ii + 1}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
            )

          case 'bullet-list':
            return (
              <ul key={gi} className="space-y-1 pl-0">
                {group.items.map((item, ii) => (
                  <li
                    key={ii}
                    className="flex items-start gap-2 text-sm text-surface-700 leading-relaxed"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-400 mt-[7px]" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            )

          case 'table': {
            if (group.items.length === 0) return null
            const headerRow = group.items[0]
            const dataRows = group.items.slice(1)
            return (
              <div key={gi} className="overflow-x-auto rounded-lg border border-surface-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-50">
                      {headerRow.cells?.map((cell, ci) => (
                        <th
                          key={ci}
                          className="px-3 py-2 text-left font-semibold text-surface-600 border-b border-surface-200"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-surface-100 last:border-0">
                        {row.cells?.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2 text-surface-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}

/**
 * Sanitizes raw AI response content before it reaches the renderer.
 * Removes markdown hashes (###), asterisks (**bold** and *), and decorative symbols.
 */
export function sanitizeAiContent(raw: string): string {
  if (!raw) return ''
  let content = raw
  content = content.replace(DECORATIVE_SYMBOLS, '')
  content = content.replace(/```[\s\S]*?```/g, '')
  content = content.replace(/`/g, '')
  // Remove markdown headers like ### or ## or #
  content = content.replace(/^#{1,6}\s*/gm, '')
  // Remove bold markdown **text**
  content = content.replace(/\*{2}(.+?)\*{2}/g, '$1')
  // Remove bullet asterisks * item
  content = content.replace(/^\*\s+/gm, '• ')
  // Remove stray asterisks
  content = content.replace(/\*/g, '')
  content = content.replace(/\n{3,}/g, '\n\n')
  return content.trim()
}
