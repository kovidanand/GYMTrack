import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Mic, 
  MicOff, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Dumbbell, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Flame,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react'
import { DEFAULT_EXERCISES } from '@/data/exercisesData'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/shared/Toast'
import { generateUUID, getQueuedExercisesForTodayWorkout, clearQueuedExercisesForTodayWorkout } from '@/lib/offline/db'
import { logCanonicalWorkout } from '@/lib/workoutService'
import { cn } from '@/lib/utils'
import type { Exercise, MuscleGroup, WorkoutSession, WorkoutSessionSet } from '@/types'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface LoggedExerciseSet {
  id: string
  set_number: number
  weight: number
  reps: number
  completed: boolean
}

export interface LoggedExerciseItem {
  id: string
  exercise: Exercise
  sets: LoggedExerciseSet[]
}

interface TrainingLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'manual' | 'voice'
  initialExerciseId?: string
}

type CategoryFilter = 'all' | 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'glutes'

const MUSCLE_GROUPS: { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Legs', value: 'legs' },
  { label: 'Arms', value: 'arms' },
  { label: 'Core', value: 'core' },
  { label: 'Glutes', value: 'glutes' },
]

export function TrainingLoggerModal({
  isOpen,
  onClose,
  initialMode = 'manual',
  initialExerciseId
}: TrainingLoggerModalProps) {
  const { user } = useAuth()
  const toast = useToast()

  // Primary mode tabs
  const [activeTab, setActiveTab] = useState<'manual' | 'voice'>(initialMode)
  // Step: 'input' or 'confirmation'
  const [step, setStep] = useState<'input' | 'confirmation'>('input')

  // Logged exercises in this session
  const [loggedItems, setLoggedItems] = useState<LoggedExerciseItem[]>([])

  // Exercise search & filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<CategoryFilter>('all')

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // ── Voice Recognition State ──
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null)
  const [missingFieldPrompt, setMissingFieldPrompt] = useState<{
    exerciseName: string
    missing: 'weight' | 'reps'
    extractedReps?: number
    extractedWeight?: number
    extractedSets?: number
    matchedExercise?: Exercise
  } | null>(null)

  const recognitionRef = useRef<any>(null)

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('input')
      setActiveTab(initialMode)
      setSearchQuery('')
      setMissingFieldPrompt(null)
      setTranscript('')
      setVoiceFeedback(null)

      if (initialExerciseId) {
        const found = DEFAULT_EXERCISES.find(e => e.id === initialExerciseId)
        if (found) {
          const isBw = found.equipment.includes('bodyweight') || found.equipment.includes('none')
          setLoggedItems([
            {
              id: generateUUID(),
              exercise: found,
              sets: [
                { id: generateUUID(), set_number: 1, weight: isBw ? 0 : 50, reps: 10, completed: true },
                { id: generateUUID(), set_number: 2, weight: isBw ? 0 : 50, reps: 10, completed: true },
                { id: generateUUID(), set_number: 3, weight: isBw ? 0 : 50, reps: 10, completed: true }
              ]
            }
          ])
          return
        }
      }

      // Check if user queued exercises from the Library (+ Add button)
      const queued = getQueuedExercisesForTodayWorkout()
      if (queued.length > 0) {
        const items: LoggedExerciseItem[] = queued.map(q => {
          const isBw = q.exercise?.equipment.includes('bodyweight') || q.exercise?.equipment.includes('none')
          const defaultW = isBw ? 0 : (Number(q.weight) || 50)
          const parsedReps = parseInt(q.reps || '10', 10) || 10
          const setsCount = q.sets || 3
          const sets: LoggedExerciseSet[] = []
          for (let s = 1; s <= setsCount; s++) {
            sets.push({
              id: generateUUID(),
              set_number: s,
              weight: defaultW,
              reps: parsedReps,
              completed: true
            })
          }
          return {
            id: generateUUID(),
            exercise: q.exercise || (DEFAULT_EXERCISES.find(e => e.id === q.exercise_id) || DEFAULT_EXERCISES[0]),
            sets
          }
        })
        setLoggedItems(items)
        return
      }

      // Default with first exercise if none provided
      const defaultEx = DEFAULT_EXERCISES.find(e => e.slug === 'bench-press') || DEFAULT_EXERCISES[0]
      const isBwDefault = defaultEx.equipment.includes('bodyweight') || defaultEx.equipment.includes('none')
      setLoggedItems([
        {
          id: generateUUID(),
          exercise: defaultEx,
          sets: [
            { id: generateUUID(), set_number: 1, weight: isBwDefault ? 0 : 50, reps: 10, completed: true },
            { id: generateUUID(), set_number: 2, weight: isBwDefault ? 0 : 50, reps: 10, completed: true },
            { id: generateUUID(), set_number: 3, weight: isBwDefault ? 0 : 50, reps: 10, completed: true }
          ]
        }
      ])
    }
  }, [isOpen, initialMode, initialExerciseId])

  // Cleanup speech recognition on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  // Filtered exercises for search & picker
  const filteredExercises = useMemo(() => {
    return DEFAULT_EXERCISES.filter(ex => {
      const matchesCategory = selectedMuscle === 'all' || (
        selectedMuscle === 'arms'
          ? ['biceps', 'triceps', 'forearms'].includes(ex.muscle_group)
          : selectedMuscle === 'legs'
          ? ['legs', 'quads', 'hamstrings', 'calves'].includes(ex.muscle_group)
          : ex.muscle_group === selectedMuscle
      )
      const matchesSearch = !searchQuery.trim() || 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primary_muscle.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedMuscle, searchQuery])

  // Computed session totals
  const sessionTotals = useMemo(() => {
    let totalSets = 0
    let totalVolume = 0
    loggedItems.forEach(item => {
      item.sets.forEach(s => {
        totalSets++
        totalVolume += (s.weight * s.reps)
      })
    })
    return {
      exercisesCount: loggedItems.length,
      totalSets,
      totalVolume
    }
  }, [loggedItems])

  // ─── MANUAL LOGGING HANDLERS ───────────────────────────────────────────────

  const handleAddExercise = (exercise: Exercise) => {
    const isBodyweight = exercise.equipment.includes('bodyweight') || exercise.equipment.includes('none')
    const newItem: LoggedExerciseItem = {
      id: generateUUID(),
      exercise,
      sets: [
        { id: generateUUID(), set_number: 1, weight: isBodyweight ? 0 : 50, reps: 10, completed: true },
        { id: generateUUID(), set_number: 2, weight: isBodyweight ? 0 : 50, reps: 10, completed: true },
        { id: generateUUID(), set_number: 3, weight: isBodyweight ? 0 : 50, reps: 10, completed: true }
      ]
    }
    setLoggedItems(prev => [...prev, newItem])
    setSearchQuery('')
  }

  const handleRemoveExercise = (itemId: string) => {
    setLoggedItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleAddSet = (itemId: string) => {
    setLoggedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const lastSet = item.sets[item.sets.length - 1]
      const newSetNumber = item.sets.length + 1
      const isBw = item.exercise.equipment.includes('bodyweight') || item.exercise.equipment.includes('none')
      const newWeight = lastSet ? lastSet.weight : (isBw ? 0 : 50)
      const newReps = lastSet ? lastSet.reps : 10
      return {
        ...item,
        sets: [
          ...item.sets,
          {
            id: generateUUID(),
            set_number: newSetNumber,
            weight: newWeight,
            reps: newReps,
            completed: true
          }
        ]
      }
    }))
  }

  const handleRemoveSet = (itemId: string, setId: string) => {
    setLoggedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const remainingSets = item.sets.filter(s => s.id !== setId)
      // re-index set numbers
      const reindexed = remainingSets.map((s, idx) => ({ ...s, set_number: idx + 1 }))
      return {
        ...item,
        sets: reindexed
      }
    }))
  }

  const handleUpdateSet = (itemId: string, setId: string, field: 'weight' | 'reps', delta: number) => {
    setLoggedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        sets: item.sets.map(s => {
          if (s.id !== setId) return s
          const currentVal = s[field]
          const newVal = Math.max(0, currentVal + delta)
          return { ...s, [field]: newVal }
        })
      }
    }))
  }

  const handleSetDirectValue = (itemId: string, setId: string, field: 'weight' | 'reps', value: number) => {
    setLoggedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        sets: item.sets.map(s => {
          if (s.id !== setId) return s
          return { ...s, [field]: Math.max(0, value) }
        })
      }
    }))
  }

  // ─── VOICE LOGGING PARSER ──────────────────────────────────────────────────

  const parseVoiceInput = (text: string) => {
    const lower = text.toLowerCase()
    setTranscript(text)

    // 1. Identify exercise match
    let matchedExercise: Exercise | null = null
    let bestMatchLen = 0

    for (const ex of DEFAULT_EXERCISES) {
      const exName = ex.name.toLowerCase()
      // Check if name is mentioned
      if (lower.includes(exName) && exName.length > bestMatchLen) {
        matchedExercise = ex
        bestMatchLen = exName.length
      } else {
        // Also check simplified keyword
        const simplified = ex.name.toLowerCase().replace(/(barbell|dumbbell|cable|machine)\s+/g, '').trim()
        if (simplified.length > 3 && lower.includes(simplified) && simplified.length > bestMatchLen) {
          matchedExercise = ex
          bestMatchLen = simplified.length
        }
      }
    }

    if (!matchedExercise) {
      setVoiceFeedback(`Could not identify exercise in: "${text}". Please select manually or speak clearly.`)
      return
    }

    const isBodyweight = matchedExercise.equipment.includes('bodyweight') || matchedExercise.equipment.includes('none')

    // 2. Extract weight
    // Match "50 kg", "50 kilos", "50 kilograms", "50 lbs", "at 50", "with 50", "@ 50"
    let extractedWeight: number | null = null
    const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?|lbs?|pounds?)/i) ||
                        lower.match(/(?:at|with|@)\s*(\d+(?:\.\d+)?)/i)
    if (weightMatch) {
      extractedWeight = parseFloat(weightMatch[1])
    } else if (isBodyweight) {
      extractedWeight = 0
    }

    // 3. Extract reps
    // Match "10 reps", "10 times", "for 10", "x 10", "sets of 10", "of 10"
    let extractedReps: number | null = null
    const repsMatch = lower.match(/(?:sets?\s+of\s+)(\d+)/i) ||
                      lower.match(/(?:of\s+)(\d+)\s*(?:reps?)?/i) ||
                      lower.match(/(\d+)\s*(?:reps?|times?)/i) ||
                      lower.match(/(?:for)\s*(\d+)/i) ||
                      lower.match(/(?:x|times)\s*(\d+)/i)
    if (repsMatch) {
      extractedReps = parseInt(repsMatch[1], 10)
    }

    // 4. Extract sets
    // Match "3 sets", "for 3 sets"
    let extractedSets = 3
    const setsMatch = lower.match(/(\d+)\s*sets?/i)
    if (setsMatch) {
      extractedSets = Math.min(10, Math.max(1, parseInt(setsMatch[1], 10)))
    }

    // 5. Detect missing fields
    if (extractedWeight === null && !isBodyweight) {
      setMissingFieldPrompt({
        exerciseName: matchedExercise.name,
        missing: 'weight',
        extractedReps: extractedReps || 10,
        extractedSets,
        matchedExercise
      })
      setVoiceFeedback(`Detected ${matchedExercise.name} for ${extractedReps || 10} reps. What weight did you use?`)
      return
    }

    if (extractedReps === null) {
      setMissingFieldPrompt({
        exerciseName: matchedExercise.name,
        missing: 'reps',
        extractedWeight: extractedWeight ?? 50,
        extractedSets,
        matchedExercise
      })
      setVoiceFeedback(`Detected ${matchedExercise.name} at ${extractedWeight ?? 50}kg. How many reps per set?`)
      return
    }

    // Fully extracted! Build item and prompt for confirmation
    const finalWeight = extractedWeight ?? 0
    const finalReps = extractedReps
    const sets: LoggedExerciseSet[] = []
    for (let i = 1; i <= extractedSets; i++) {
      sets.push({
        id: generateUUID(),
        set_number: i,
        weight: finalWeight,
        reps: finalReps,
        completed: true
      })
    }

    const newItem: LoggedExerciseItem = {
      id: generateUUID(),
      exercise: matchedExercise,
      sets
    }

    setLoggedItems([newItem])
    setMissingFieldPrompt(null)
    setVoiceFeedback(`Successfully captured: ${matchedExercise.name} — ${extractedSets} sets × ${finalReps} reps @ ${finalWeight}kg. Ready to review!`)
    setStep('confirmation')
  }

  const handleResolveMissingField = (value: number) => {
    if (!missingFieldPrompt?.matchedExercise) return
    const { matchedExercise, missing, extractedReps, extractedWeight, extractedSets } = missingFieldPrompt
    const weight = missing === 'weight' ? value : (extractedWeight ?? 50)
    const reps = missing === 'reps' ? value : (extractedReps ?? 10)
    const setsCount = extractedSets || 3

    const sets: LoggedExerciseSet[] = []
    for (let i = 1; i <= setsCount; i++) {
      sets.push({
        id: generateUUID(),
        set_number: i,
        weight,
        reps,
        completed: true
      })
    }

    const newItem: LoggedExerciseItem = {
      id: generateUUID(),
      exercise: matchedExercise,
      sets
    }

    setLoggedItems([newItem])
    setMissingFieldPrompt(null)
    setVoiceFeedback(`Captured ${matchedExercise.name} — ${setsCount} sets × ${reps} reps @ ${weight}kg. Ready to review!`)
    setStep('confirmation')
  }

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('Voice Logging Unavailable', 'Speech recognition is not supported in this browser. Please use Manual Log.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceFeedback('Listening... Speak your workout (e.g. "Bench press 50 kilos for 10 reps, 3 sets")')
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setIsListening(false)
        parseVoiceInput(text)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        setVoiceFeedback(`Voice recognition error: ${event.error || 'Could not capture speech'}. Try again or use manual tab.`)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      toast.error('Microphone Access Error', 'Please verify microphone permissions.')
    }
  }

  // ─── COMMITTING TO LOCAL & REMOTE DATABASE ─────────────────────────────────

  const handleConfirmAndSave = async () => {
    if (!user) {
      toast.error('Authentication Required', 'Please sign in to log workouts.')
      return
    }

    if (loggedItems.length === 0) {
      toast.error('Empty Workout', 'Please log at least one exercise and set.')
      return
    }

    setIsSaving(true)

    try {
      const exercisesPayload = loggedItems.map(item => ({
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        sets: item.sets.map(s => ({
          setNumber: s.set_number,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          completed: s.completed !== false
        }))
      }))

      const result = await logCanonicalWorkout({
        userId: user.id,
        workoutName: loggedItems.length === 1 
          ? `${loggedItems[0].exercise.name} Training`
          : `${loggedItems[0].exercise.muscle_group.toUpperCase()} Focus Session`,
        exercises: exercisesPayload,
        source: activeTab === 'voice' ? 'voice' : 'home'
      })

      if (!result.success) {
        toast.error('Save Failed', result.error || 'Could not record workout session. Please try again.')
        setIsSaving(false)
        return
      }

      toast.success(
        'Workout Logged Successfully!',
        `${sessionTotals.exercisesCount} exercises, ${sessionTotals.totalSets} sets, ${sessionTotals.totalVolume.toLocaleString()} kg volume saved.`
      )

      setIsSaving(false)
      onClose()
    } catch (err) {
      console.error('[GYMTrack] Error saving workout log:', err)
      toast.error('Save Failed', 'Could not record workout session. Please try again.')
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-logger-title"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-surface-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── MODAL HEADER ── */}
        <div className="p-4 sm:px-6 bg-surface-50 border-b border-surface-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-xs">
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 id="training-logger-title" className="text-base sm:text-lg font-bold text-surface-900 leading-tight">
                {step === 'confirmation' ? 'Review & Confirm Training' : 'Log Today’s Training'}
              </h2>
              <p className="text-xs text-surface-500">
                {step === 'confirmation' 
                  ? 'Verify your sets and volume before saving' 
                  : 'Fast manual entry or conversational voice logging'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-200 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── STEP 1: INPUT MODE (MANUAL / VOICE) ── */}
        {step === 'input' && (
          <>
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-surface-200 px-6 pt-2 bg-white flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={cn(
                  'py-2.5 px-4 text-xs font-bold border-b-2 -mb-px transition-colors flex items-center gap-2',
                  activeTab === 'manual'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-surface-500 hover:text-surface-900'
                )}
              >
                <Dumbbell size={15} />
                Manual Logging
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={cn(
                  'py-2.5 px-4 text-xs font-bold border-b-2 -mb-px transition-colors flex items-center gap-2',
                  activeTab === 'voice'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-surface-500 hover:text-surface-900'
                )}
              >
                <Mic size={15} />
                Voice Logging
                <span className="badge bg-brand-50 text-brand-700 border-brand-200 text-[10px] py-0 px-1.5 font-bold">
                  Hands-free
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* ─── TAB 1: MANUAL ENTRY ─── */}
              {activeTab === 'manual' && (
                <div className="space-y-6">
                  {/* Active Exercise Cards */}
                  <div className="space-y-4">
                    {loggedItems.map((item, itemIdx) => (
                      <div key={item.id} className="card p-4 sm:p-5 bg-white border border-surface-200 shadow-2xs rounded-xl space-y-4">
                        {/* Exercise Title Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-black text-xs flex items-center justify-center">
                              {itemIdx + 1}
                            </span>
                            <div>
                              <h3 className="font-bold text-surface-900 text-sm sm:text-base">
                                {item.exercise.name}
                              </h3>
                              <span className="text-[11px] font-semibold text-surface-400 capitalize">
                                {item.exercise.muscle_group} • {item.exercise.equipment.join(', ')}
                              </span>
                            </div>
                          </div>

                          {loggedItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(item.id)}
                              className="text-xs text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                              title="Remove exercise"
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Sets Table */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-surface-400 uppercase tracking-wider px-2">
                            <div className="col-span-2 text-center">Set</div>
                            <div className="col-span-4 text-center">Weight (kg)</div>
                            <div className="col-span-4 text-center">Reps</div>
                            <div className="col-span-2 text-right">Delete</div>
                          </div>

                          {item.sets.map(s => (
                            <div 
                              key={s.id} 
                              className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-surface-50 border border-surface-100 hover:border-surface-200 transition-colors"
                            >
                              {/* Set Number */}
                              <div className="col-span-2 text-center font-bold text-xs text-surface-700">
                                #{s.set_number}
                              </div>

                              {/* Weight Control */}
                              <div className="col-span-4 flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSet(item.id, s.id, 'weight', -5)}
                                  className="w-6 h-6 rounded bg-white border border-surface-200 text-surface-600 hover:bg-surface-100 flex items-center justify-center text-xs font-bold"
                                  title="-5 kg"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={s.weight}
                                  onChange={e => handleSetDirectValue(item.id, s.id, 'weight', parseFloat(e.target.value) || 0)}
                                  className="w-14 text-center py-1 text-xs font-bold bg-white border border-surface-200 rounded focus:ring-1 focus:ring-brand-500"
                                  min="0"
                                  step="0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSet(item.id, s.id, 'weight', 5)}
                                  className="w-6 h-6 rounded bg-white border border-surface-200 text-surface-600 hover:bg-surface-100 flex items-center justify-center text-xs font-bold"
                                  title="+5 kg"
                                >
                                  +
                                </button>
                              </div>

                              {/* Reps Control */}
                              <div className="col-span-4 flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSet(item.id, s.id, 'reps', -1)}
                                  className="w-6 h-6 rounded bg-white border border-surface-200 text-surface-600 hover:bg-surface-100 flex items-center justify-center text-xs font-bold"
                                  title="-1 rep"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={s.reps}
                                  onChange={e => handleSetDirectValue(item.id, s.id, 'reps', parseInt(e.target.value, 10) || 0)}
                                  className="w-12 text-center py-1 text-xs font-bold bg-white border border-surface-200 rounded focus:ring-1 focus:ring-brand-500"
                                  min="0"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSet(item.id, s.id, 'reps', 1)}
                                  className="w-6 h-6 rounded bg-white border border-surface-200 text-surface-600 hover:bg-surface-100 flex items-center justify-center text-xs font-bold"
                                  title="+1 rep"
                                >
                                  +
                                </button>
                              </div>

                              {/* Delete Set */}
                              <div className="col-span-2 flex justify-end pr-1">
                                {item.sets.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSet(item.id, s.id)}
                                    className="p-1 rounded text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete set"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-surface-300">-</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Set Button */}
                        <button
                          type="button"
                          onClick={() => handleAddSet(item.id)}
                          className="w-full py-2 rounded-lg border border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus size={14} />
                          <span>Add Set</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Another Exercise Drawer / Search */}
                  <div className="card p-4 bg-surface-50/70 border border-surface-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus size={14} className="text-brand-600" />
                        Add Another Exercise to Session
                      </h4>
                      <span className="text-[11px] text-surface-400">
                        {DEFAULT_EXERCISES.length}+ available
                      </span>
                    </div>

                    {/* Muscle Filter Chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {MUSCLE_GROUPS.map(mg => (
                        <button
                          key={mg.value}
                          type="button"
                          onClick={() => setSelectedMuscle(mg.value)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors',
                            selectedMuscle === mg.value
                              ? 'bg-brand-500 text-white shadow-2xs'
                              : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-100'
                          )}
                        >
                          {mg.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-surface-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search exercise name (e.g. Incline Bench, Squat, Pulldown)..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Quick Pick List (top 4 or search results) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pt-1">
                      {filteredExercises.slice(0, 6).map(ex => {
                        const isAlreadyLogged = loggedItems.some(item => item.exercise.id === ex.id)
                        return (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => handleAddExercise(ex)}
                            disabled={isAlreadyLogged}
                            className={cn(
                              'p-2 rounded-lg border text-left flex items-center justify-between transition-colors',
                              isAlreadyLogged
                                ? 'bg-surface-100 border-surface-200 opacity-50 cursor-not-allowed'
                                : 'bg-white border-surface-200 hover:border-brand-400 hover:bg-brand-50/50'
                            )}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-surface-800 truncate">{ex.name}</p>
                              <p className="text-[10px] text-surface-400 capitalize">{ex.muscle_group}</p>
                            </div>
                            <span className="text-[10px] font-bold text-brand-600 flex-shrink-0">
                              {isAlreadyLogged ? 'Added' : '+ Add'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: VOICE ENTRY ─── */}
              {activeTab === 'voice' && (
                <div className="space-y-6 text-center py-4">
                  {/* Microphone Action Button */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      {isListening && (
                        <div className="absolute -inset-3 rounded-full bg-brand-400 opacity-30 animate-ping pointer-events-none" />
                      )}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={cn(
                          'w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all',
                          isListening
                            ? 'bg-red-500 scale-105 ring-4 ring-red-200'
                            : 'bg-brand-500 hover:bg-brand-600 hover:scale-105'
                        )}
                        aria-label={isListening ? 'Stop listening' : 'Start speaking'}
                      >
                        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-surface-900">
                        {isListening ? 'Listening...' : 'Tap Microphone to Speak'}
                      </h3>
                      <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
                        Speak naturally: &ldquo;Bench press 50 kilos for 10 reps, 3 sets&rdquo; or &ldquo;Squat 80 kg 8 reps&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Live Transcript / Feedback Box */}
                  {transcript && (
                    <div className="card p-3 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-800 text-left font-mono">
                      <span className="text-[10px] font-bold text-surface-400 uppercase block mb-1">
                        Speech Transcript
                      </span>
                      &ldquo;{transcript}&rdquo;
                    </div>
                  )}

                  {voiceFeedback && (
                    <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 text-left flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                      <div>{voiceFeedback}</div>
                    </div>
                  )}

                  {/* Missing Field Interactive Prompt */}
                  {missingFieldPrompt && (
                    <div className="card p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left space-y-3 animate-scale-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-900">
                          {missingFieldPrompt.missing === 'weight'
                            ? `What weight (kg) did you use for ${missingFieldPrompt.exerciseName}?`
                            : `How many reps did you complete for ${missingFieldPrompt.exerciseName}?`}
                        </h4>
                      </div>

                      {missingFieldPrompt.missing === 'weight' ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[20, 40, 50, 60, 80, 100].map(w => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => handleResolveMissingField(w)}
                              className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-surface-800 hover:bg-amber-100 transition-colors"
                            >
                              {w} kg
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[6, 8, 10, 12, 15, 20].map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleResolveMissingField(r)}
                              className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-surface-800 hover:bg-amber-100 transition-colors"
                            >
                              {r} reps
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voice Captured Preview */}
                  {loggedItems.length > 0 && !missingFieldPrompt && (
                    <div className="text-left card p-4 bg-white border border-surface-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                          Ready for Review
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <Check size={13} /> Parsed Correctly
                        </span>
                      </div>
                      {loggedItems.map(item => (
                        <div key={item.id} className="text-xs p-2.5 bg-surface-50 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="font-bold text-surface-900">{item.exercise.name}</span>
                            <span className="text-surface-500 ml-2">({item.sets.length} sets)</span>
                          </div>
                          <span className="font-mono text-surface-700">
                            {item.sets[0]?.weight}kg × {item.sets[0]?.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── FOOTER: PROCEED TO CONFIRMATION ── */}
            <div className="p-4 sm:px-6 bg-surface-50 border-t border-surface-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4 text-xs font-semibold text-surface-600">
                <span><strong>{sessionTotals.exercisesCount}</strong> exercises</span>
                <span>•</span>
                <span><strong>{sessionTotals.totalSets}</strong> sets</span>
                <span>•</span>
                <span><strong>{sessionTotals.totalVolume.toLocaleString()}</strong> kg volume</span>
              </div>

              <button
                type="button"
                onClick={() => setStep('confirmation')}
                disabled={loggedItems.length === 0 || !!missingFieldPrompt}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                id="btn-proceed-review"
              >
                <span>Review & Confirm</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: MANDATORY REVIEW & CONFIRMATION ── */}
        {step === 'confirmation' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Telemetry Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-surface-50 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-sm">Session Summary</h3>
                    <p className="text-xs text-surface-500">
                      Will update Today&rsquo;s Activity, Weekly Snapshot, and calculated volume.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-brand-600 tracking-tight">
                    {sessionTotals.totalVolume.toLocaleString()} kg
                  </div>
                  <div className="text-[10px] font-semibold text-surface-400 uppercase">
                    Total Volume
                  </div>
                </div>
              </div>

              {/* Stat Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 bg-white border border-surface-200 text-center rounded-xl">
                  <p className="text-[11px] font-semibold text-surface-500 uppercase">Exercises</p>
                  <p className="text-xl font-black text-surface-900 mt-0.5">{sessionTotals.exercisesCount}</p>
                </div>
                <div className="card p-3 bg-white border border-surface-200 text-center rounded-xl">
                  <p className="text-[11px] font-semibold text-surface-500 uppercase">Total Sets</p>
                  <p className="text-xl font-black text-surface-900 mt-0.5">{sessionTotals.totalSets}</p>
                </div>
                <div className="card p-3 bg-white border border-surface-200 text-center rounded-xl">
                  <p className="text-[11px] font-semibold text-surface-500 uppercase">Est. Duration</p>
                  <p className="text-xl font-black text-surface-900 mt-0.5">
                    {Math.round((sessionTotals.totalSets * 90) / 60)}m
                  </p>
                </div>
              </div>

              {/* Full Detailed Breakdown */}
              <div className="card bg-white border border-surface-200 rounded-xl divide-y divide-surface-100 overflow-hidden">
                <div className="p-3 bg-surface-50/80 px-4 text-xs font-bold text-surface-700 flex items-center justify-between">
                  <span>Exercise Details</span>
                  <span>Completed Sets</span>
                </div>

                {loggedItems.map((item, idx) => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-surface-900 text-sm">{item.exercise.name}</h4>
                      </div>
                      <span className="badge bg-surface-100 text-surface-600 text-[10px] uppercase font-bold py-0.5 px-2">
                        {item.exercise.muscle_group}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {item.sets.map(s => (
                        <div 
                          key={s.id} 
                          className="p-2 rounded-lg bg-surface-50 border border-surface-100 text-xs flex items-center justify-between"
                        >
                          <span className="text-surface-500 font-semibold">Set {s.set_number}</span>
                          <span className="font-mono font-bold text-surface-900">
                            {s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps} reps`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FOOTER: SAVE / CONFIRM ── */}
            <div className="p-4 sm:px-6 bg-surface-50 border-t border-surface-200 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={isSaving}
                className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                id="btn-back-edit"
              >
                <ArrowLeft size={14} />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                disabled={isSaving}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                id="btn-confirm-log"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Workout...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Confirm & Log Training</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
