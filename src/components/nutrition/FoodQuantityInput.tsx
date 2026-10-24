import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface FoodQuantityInputProps {
  value: number
  onChange: (quantity: number) => void
  unitLabel?: string
  unitType?: string // 'g' | 'ml' | 'serving' | 'roti' | etc.
  householdEquivalence?: string
  isApproximateEquivalence?: boolean
  presets?: number[]
  min?: number
  max?: number
  id?: string
  className?: string
  onValidChange?: (isValid: boolean) => void
}

/**
 * Robust Food Quantity Input component
 * - Fully separates editable string state from numeric calculation state
 * - Supports select-all, delete, backspace, and replacement without forced reset to 1
 * - Preserves decimal typing (e.g. "1.", "1.5") without clobbering
 * - Provides quick amount preset chips (e.g. 0.5, 1, 2, 4 or 50, 100, 200g)
 * - Auto-selects on focus so typing a number replaces the previous value seamlessly on mobile
 * - Enforces sensible validation bounds (min > 0, max <= 10,000)
 */
export function FoodQuantityInput({
  value,
  onChange,
  unitLabel = '',
  unitType = 'serving',
  householdEquivalence,
  isApproximateEquivalence = false,
  presets,
  min = 0.01,
  max = 10000,
  id = 'food-quantity-input',
  className = '',
  onValidChange,
}: FoodQuantityInputProps) {
  // Local string state preserves active user typing (e.g. "1.", "", "0.")
  const [textValue, setTextValue] = useState<string>(() => (value ? String(value) : '1'))
  const [isFocused, setIsFocused] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isInternalChangeRef = useRef(false)

  // Sync from external value only when NOT actively typing or focused
  useEffect(() => {
    if (!isFocused && !isInternalChangeRef.current) {
      if (value > 0) {
        setTextValue(String(value))
        setErrorMessage(null)
        onValidChange?.(true)
      }
    }
    isInternalChangeRef.current = false
  }, [value, isFocused, onValidChange])

  // Determine standard presets based on unit type
  const effectivePresets = React.useMemo(() => {
    if (presets && presets.length > 0) return presets
    const lower = unitType.toLowerCase()
    if (lower === 'g' || lower === 'grams') {
      return [50, 100, 150, 200, 250]
    }
    if (lower === 'ml' || lower === 'millilitres') {
      return [100, 200, 250, 500]
    }
    // Countable items (roti, banana, egg, scoop, slice, serving)
    return [0.5, 1, 2, 4]
  }, [presets, unitType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    isInternalChangeRef.current = true

    // Allow empty string so user can delete all and start fresh
    if (raw === '') {
      setTextValue('')
      setErrorMessage('Please enter an amount')
      onValidChange?.(false)
      return
    }

    // Only allow digits and at most one decimal point
    if (!/^\d*\.?\d*$/.test(raw)) {
      return
    }

    setTextValue(raw)

    // Parse numeric value
    const parsed = parseFloat(raw)
    if (isNaN(parsed)) {
      setErrorMessage('Please enter a valid number')
      onValidChange?.(false)
      return
    }

    if (parsed <= 0) {
      setErrorMessage('Amount must be greater than 0')
      onValidChange?.(false)
      return
    }

    if (parsed > max) {
      setErrorMessage(`Amount cannot exceed ${max.toLocaleString()}`)
      onValidChange?.(false)
      return
    }

    // Valid number within bounds: propagate to parent immediately for real-time live preview
    setErrorMessage(null)
    onValidChange?.(true)
    onChange(parsed)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Select all on focus: typing any digit immediately replaces the current value
    e.target.select()
  }

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseFloat(textValue)

    if (isNaN(parsed) || parsed <= 0) {
      // Revert to current valid value or 1
      const fallback = value > 0 ? value : 1
      setTextValue(String(fallback))
      setErrorMessage(null)
      onValidChange?.(true)
      onChange(fallback)
    } else if (parsed > max) {
      setTextValue(String(max))
      setErrorMessage(null)
      onValidChange?.(true)
      onChange(max)
    } else {
      // Format cleanly (e.g. "1." -> "1")
      setTextValue(String(parsed))
      setErrorMessage(null)
      onValidChange?.(true)
    }
  }

  const handleApplyPreset = (preset: number) => {
    isInternalChangeRef.current = true
    setTextValue(String(preset))
    setErrorMessage(null)
    onValidChange?.(true)
    onChange(preset)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={textValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter amount (e.g. 4)"
          className={cn(
            'input-base text-base sm:text-sm font-bold min-h-[44px] px-3.5 w-full bg-white shadow-2xs transition-colors',
            errorMessage ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-surface-200'
          )}
          aria-label="Food amount"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
        />
        {unitLabel && (
          <span className="absolute right-3.5 text-xs font-bold text-surface-500 pointer-events-none truncate max-w-[100px]">
            {unitLabel}
          </span>
        )}
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <p id={`${id}-error`} className="text-xs text-red-600 font-semibold flex items-center gap-1">
          <span>⚠</span>
          <span>{errorMessage}</span>
        </p>
      )}

      {/* Convenient Quick Presets */}
      {effectivePresets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-bold text-surface-400 mr-1 select-none">Quick:</span>
          {effectivePresets.map(preset => {
            const isSelected = value === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs',
                  isSelected
                    ? 'bg-brand-600 text-white font-extrabold shadow-xs scale-105'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200 hover:text-surface-900'
                )}
                aria-label={`Set amount to ${preset}`}
              >
                {preset}
              </button>
            )
          })}
        </div>
      )}

      {/* Household Equivalence / Portion Info */}
      {householdEquivalence && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 px-3 py-1.5 rounded-lg border border-emerald-200/80 shadow-2xs">
          <span className="truncate">{householdEquivalence}</span>
          {isApproximateEquivalence && (
            <span className="text-[10px] text-emerald-600 font-normal ml-auto flex-shrink-0">
              (approximate)
            </span>
          )}
        </div>
      )}
    </div>
  )
}
