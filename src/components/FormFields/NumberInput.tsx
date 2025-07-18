import { useId, useState } from 'react'
import { ErrorMessage } from './ErrorMessage'
import { FloatingLabel } from './FloatingLabel'
import { cn } from '@/lib/utils'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> extends NumericFormatProps {
  label: string
  name: FieldPath<T>
  control: Control<T>
  prefix?: string
}

export function NumberInput<T extends FieldValues>({
  id,
  label,
  className,
  name,
  control,
  prefix,
  onFocus,
  ...props
}: Props<T>) {
  const [isFocused, setIsFocused] = useState(false)
  const ownId = useId()
  const newId = id ?? ownId

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
              <NumericFormat
                id={newId}
                name={fieldName}
                value={value}
                disabled={disabled}
                prefix={prefix}
                onValueChange={({ value }) => onChange(value)}
                onBlur={e => {
                  setIsFocused(false)
                  onBlur()
                }}
                onFocus={e => {
                  setIsFocused(true)
                  onFocus?.(e)
                }}
                getInputRef={ref}
                thousandSeparator=","
                allowLeadingZeros={false}
                allowNegative={false}
                autoComplete="off"
                className={cn(
                  'w-full h-16 px-4 pt-4 bg-bg-60 rounded-sm text-text-100 focus:outline-none font-rootstock-sans flex justify-end items-end overflow-hidden',
                  className,
                )}
                {...props}
              />
            </FloatingLabel>
          </ErrorMessage>
        )
      }}
    />
  )
}
