import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, useCallback, useEffect, useId, useRef, useState } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  minRows?: number
  maxRows?: number
  errorMsg?: string
}

export function TextArea({
  label,
  errorMsg,
  className,
  minRows = 5,
  maxRows = 40,
  value,
  onInput,
  ...props
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const ownId = useId()
  const id = props.id ?? ownId
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    textarea.style.height = 'auto'
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const rows = Math.floor(textarea.scrollHeight / lineHeight)
    const clampedRows = Math.max(minRows, Math.min(maxRows, rows))
    textarea.style.height = `${clampedRows * lineHeight}px`
    textarea.style.overflowY = rows > maxRows ? 'auto' : 'hidden'
  }, [maxRows, minRows])

  useEffect(() => {
    adjustHeight()
    window.addEventListener('resize', adjustHeight)
    return () => window.removeEventListener('resize', adjustHeight)
  }, [adjustHeight, value])

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight()
    onInput?.(e)
  }

  return (
    <ErrorMessage errorMsg={errorMsg}>
      <FloatingLabel htmlFor={id} isFloating={isFocused || !!value} label={label}>
        <div className="w-full px-4 pt-8 pb-2 bg-bg-60 rounded-sm ">
          <textarea
            id={id}
            ref={textareaRef}
            rows={minRows}
            value={value}
            className={cn('w-full text-text-100 resize-none focus:outline-none', className)}
            onInput={handleInput}
            onFocus={e => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={e => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
        </div>
      </FloatingLabel>
    </ErrorMessage>
  )
}
