import { cn } from '@/lib/utils'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { FloatingLabel } from './FloatingLabel'
import { ErrorMessage } from './ErrorMessage'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: FieldPath<T>
  control: Control<T>
}

export function TextInput<T extends FieldValues>({
  id,
  label,
  className,
  name,
  control,
  onFocus,
  ...props
}: Props<T>) {
  const ownId = useId()
  const newId = id ?? ownId
  const [isFocused, setIsFocused] = useState(false)

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

        return (
          <ErrorMessage errorMsg={error?.message}>
            <FloatingLabel htmlFor={newId} isFloating={shouldFloat} label={label}>
              <input
                id={newId}
                name={fieldName}
                ref={ref}
                value={value || ''}
                disabled={disabled}
                type="text"
                className={cn(
                  'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end overflow-hidden',
                  className,
                )}
                onFocus={e => {
                  setIsFocused(true)
                  onFocus?.(e)
                }}
                onBlur={e => {
                  setIsFocused(false)
                  onBlur()
                }}
                onChange={onChange}
                autoComplete="off"
                {...props}
              />
            </FloatingLabel>
          </ErrorMessage>
        )
      }}
    />
  )
}
