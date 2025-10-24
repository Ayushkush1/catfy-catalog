import React, { useState, useRef, useCallback, useEffect } from 'react'

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface NumberInputProps {
  value: number | string
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  placeholder,
  className = '',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState(String(value || ''))
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldMaintainFocusRef = useRef(false)

  // Debounce the display value to provide real-time updates without focus loss
  const debouncedDisplayValue = useDebounce(displayValue, 300)

  // Update display value when prop value changes
  const clampValue = useCallback(
    (val: number): number => {
      return Math.min(Math.max(val, min), max)
    },
    [min, max]
  )

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(String(value || ''))
    }
  }, [value, isFocused])

  // Handle debounced onChange for real-time updates while typing
  useEffect(() => {
    if (isFocused && debouncedDisplayValue !== String(value || '')) {
      const numericValue = parseFloat(debouncedDisplayValue)
      if (!isNaN(numericValue)) {
        const clampedValue = clampValue(numericValue)
        onChange(clampedValue)
      } else if (
        debouncedDisplayValue === '' ||
        debouncedDisplayValue === '-'
      ) {
        onChange(0)
      }
    }
  }, [debouncedDisplayValue, isFocused, value, clampValue, onChange])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setDisplayValue(newValue)

      // Don't call onChange immediately during typing to prevent focus loss
      // onChange will be called on blur instead
    },
    []
  )

  const incrementValue = useCallback(() => {
    const currentValue = parseFloat(displayValue) || 0
    const newValue = clampValue(currentValue + step)
    if (newValue !== currentValue) {
      shouldMaintainFocusRef.current = true
      setDisplayValue(String(newValue))
      onChange(newValue)

      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        if (inputRef.current && shouldMaintainFocusRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
          shouldMaintainFocusRef.current = false
        }
      })
    }
  }, [displayValue, step, clampValue, onChange])

  const decrementValue = useCallback(() => {
    const currentValue = parseFloat(displayValue) || 0
    const newValue = clampValue(currentValue - step)
    if (newValue !== currentValue) {
      shouldMaintainFocusRef.current = true
      setDisplayValue(String(newValue))
      onChange(newValue)

      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        if (inputRef.current && shouldMaintainFocusRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
          shouldMaintainFocusRef.current = false
        }
      })
    }
  }, [displayValue, step, clampValue, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          incrementValue()
          break
        case 'ArrowDown':
          e.preventDefault()
          decrementValue()
          break
        case 'Enter':
          e.preventDefault()
          inputRef.current?.blur()
          return
        case 'Escape':
          e.preventDefault()
          setDisplayValue(String(value || ''))
          inputRef.current?.blur()
          return
        default:
          return
      }
    },
    [incrementValue, decrementValue, value]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Select all text on focus for easy editing
    e.target.select()
  }, [])

  const handleBlur = useCallback(() => {
    // Don't blur if we're maintaining focus for arrow key operations
    if (shouldMaintainFocusRef.current) {
      return
    }

    setIsFocused(false)
    // Ensure the display value is properly formatted
    const numericValue = parseFloat(displayValue) || 0
    const clampedValue = clampValue(numericValue)
    setDisplayValue(String(clampedValue))
    onChange(clampedValue)
  }, [displayValue, clampValue, onChange])

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      if (!isFocused) return

      e.preventDefault()
      if (e.deltaY > 0) {
        decrementValue()
      } else {
        incrementValue()
      }
    },
    [isFocused, incrementValue, decrementValue]
  )

  return (
    <div className="relative inline-flex">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onWheel={handleWheel}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          ${className}
          pr-6
          transition-all duration-200 focus:border-blue-500 focus:outline-none
          focus:ring-2 focus:ring-blue-500
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'}
        `.trim()}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="absolute right-0 top-0 flex h-full flex-col">
        <button
          type="button"
          onClick={incrementValue}
          disabled={disabled}
          className={`
            flex-1 px-1 text-[10px] leading-none text-gray-500
             
            transition-colors duration-150
            
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `.trim()}
          tabIndex={-1}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={decrementValue}
          disabled={disabled}
          className={`
            flex-1 px-1 text-[10px] leading-none text-gray-500
            
            transition-colors duration-150
            
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `.trim()}
          tabIndex={-1}
        >
          ▼
        </button>
      </div>
    </div>
  )
}

export default NumberInput
