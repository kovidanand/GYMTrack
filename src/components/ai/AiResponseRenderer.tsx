import React from 'react'

/**
 * AiResponseRenderer
 * 
 * Converts raw AI response text (which may contain Markdown syntax from either
 * the Edge Function or the deterministic engine) into clean, professional React UI.
 * 
 * Rules:
 * - Never display raw Markdown syntax (###, **, ***, ---, etc.)
 * - Never display decorative symbols (★, ☆, ✦, ✧, ✨, etc.)
 * - Never use dangerouslySetInnerHTML
 * - Uses the application's existing typography system
 */

interface AiResponseRendererProps {
  content: string
  imageUrl?: string
  className?: string
}

// ── Sanitization ───────────────────────────────────────────────────────────

const DECORATIVE_SYMBOLS = /[★☆✦✧✨⭐🌟💪🏋️‍♂️🏋️‍♀️🔥💥⚡🎯🏆🥇🥈🥉✅❌⚠️🔴🟢🟡🔵📊📈📉🎉🎊💯🙌👏🤝💡📌📍🔑]/g

function stripDecorative(text: string): string {
  return text.replace(DECORATIVE_SYMBOLS, '').trim()
}

function stripMarkdownInline(text: string): string {
  // Remove bold/italic markers: ***text***, **text**, *text*
  let result = text.replace(/\*{3}(.+?)\*{3}/g, '$1')
  result = result.replace(/\*{2}(.+?)\*{2}/g, '$1')
  result = result.replace(/\*(.+?)\*/g, '$1')
  // Remove inline code backticks
  result = result.replace(/`([^`]+)`/g, '$1')
  // Remove decorative symbols
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

  // Horizontal rule
  if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
    return { type: 'separator', text: '' }
  }

  // Table row (contains |)
  if (trimmed.includes('|') && (trimmed.startsWith('|') || trimmed.includes('|'))) {
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

  // Headings (### / ## / #)
  const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
  if (headingMatch) {
    const level = headingMatch[1].length
    return {
      type: level <= 2 ? 'heading' : 'subheading',
      text: stripMarkdownInline(headingMatch[2]),
      level
    }
  }

  // Numbered list: 1. item, 2. item
  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
  if (numberedMatch) {
    return { type: 'numbered-list-item', text: stripMarkdownInline(numberedMatch[2]) }
  }

  // Bullet list: - item or * item or • item
  const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/)
  if (bulletMatch) {
    return { type: 'bullet-list-item', text: stripMarkdownInline(bulletMatch[1]) }
  }

  // Bold-label line: **Label:** rest of text
  const boldLabelMatch = trimmed.match(/^\*{2}(.+?)\*{2}:?\s*(.*)$/)
  if (boldLabelMatch && !boldLabelMatch[2]) {
    return { type: 'subheading', text: stripDecorative(boldLabelMatch[1]) }
  }
  if (boldLabelMatch && boldLabelMatch[2]) {
    return { type: 'bold-label', text: stripDecorative(`${boldLabelMatch[1]}: ${boldLabelMatch[2]}`) }
  }

  // Regular body text
  return { type: 'body', text: stripMarkdownInline(trimmed) }
}

// ── Group sequential list items ────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────

export function AiResponseRenderer({ content, imageUrl, className = '' }: AiResponseRendererProps) {
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
 * This is the final normalization layer that catches any remaining artifacts.
 */
export function sanitizeAiContent(raw: string): string {
  if (!raw) return ''

  let content = raw

  // Strip decorative symbols
  content = content.replace(DECORATIVE_SYMBOLS, '')

  // Strip triple-backtick code fences
  content = content.replace(/```[\s\S]*?```/g, '')

  // Strip remaining backticks
  content = content.replace(/`/g, '')

  // Collapse excessive newlines (more than 2 → 2)
  content = content.replace(/\n{3,}/g, '\n\n')

  return content.trim()
}
