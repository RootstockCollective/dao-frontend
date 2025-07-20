import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, useCallback, useEffect, useId, useRef, useState } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

interface TextAreaProps<T extends FieldValues> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  minRows?: number
  maxRows?: number
  name: FieldPath<T>
  control: Control<T>
}

export function TextArea<T extends FieldValues>({
  id,
  label,
  className,
  minRows = 5,
  maxRows = 40,
  name,
  control,
  onInput,
  onFocus,
  ...props
}: TextAreaProps<T>) {
  const [isFocused, setIsFocused] = useState(false)
  const ownId = useId()
  const newId = id ?? ownId
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current

    // Save current scroll position and cursor position
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const cursorPosition = textarea.selectionStart

    textarea.style.height = 'auto'
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const rows = Math.floor(textarea.scrollHeight / lineHeight)
    const clampedRows = Math.max(minRows, Math.min(maxRows, rows))
    textarea.style.height = `${clampedRows * lineHeight}px`
    textarea.style.overflowY = rows > maxRows ? 'auto' : 'hidden'

    // Restore scroll position and cursor
    window.scrollTo(0, scrollTop)
    textarea.setSelectionRange(cursorPosition, cursorPosition)
  }, [maxRows, minRows])

  useEffect(() => {
    adjustHeight()

    // Debounce resize handler to prevent excessive calls
    let resizeTimeout: NodeJS.Timeout
    const debouncedAdjustHeight = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(adjustHeight, 100)
    }

    window.addEventListener('resize', debouncedAdjustHeight)
    return () => {
      window.removeEventListener('resize', debouncedAdjustHeight)
      clearTimeout(resizeTimeout)
    }
  }, [adjustHeight])

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight()
    onInput?.(e)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { name: fieldName, onBlur, onChange, value, ref, disabled },
        fieldState: { error },
      }) => {
        const hasValue = value !== undefined && value !== null && value !== ''
        const shouldFloat = isFocused || hasValue

        // Combine refs
        const setRefs = (element: HTMLTextAreaElement | null) => {
          textareaRef.current = element
          if (typeof ref === 'function') {
            ref(element)
          } else if (ref && 'current' in ref) {
            ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element
          }
        }

        return (
          <ErrorMessage errorMsg={error?.message}>
            <FloatingLabel htmlFor={newId} isFloating={shouldFloat} label={label}>
              <div className="w-full px-4 pt-8 pb-2 bg-bg-60 rounded-sm ">
                <textarea
                  id={newId}
                  name={fieldName}
                  ref={setRefs}
                  rows={minRows}
                  value={value || ''}
                  disabled={disabled}
                  className={cn(
                    'w-full text-text-100 resize-none focus:outline-none overflow-hidden',
                    className,
                  )}
                  onInput={e => {
                    handleInput(e)
                    onChange(e)
                  }}
                  onFocus={e => {
                    setIsFocused(true)
                    onFocus?.(e)
                  }}
                  onBlur={e => {
                    setIsFocused(false)
                    onBlur()
                  }}
                  autoComplete="off"
                  {...props}
                />
              </div>
            </FloatingLabel>
          </ErrorMessage>
        )
      }}
    />
  )
}
