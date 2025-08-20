import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import { Select, type SelectProps } from '@/components/Select'
import { ErrorMessage } from './ErrorMessage'

interface Props<T extends FieldValues> extends Omit<SelectProps, 'onValueChange' | 'onBlur' | 'value'> {
  name: FieldPath<T>
  control: Control<T>
  /**
   * Value to display when form value is null
   * For example: 'No milestone', 'No category', etc.
   */
  nullDisplayValue?: string
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  nullDisplayValue,
  options = [],
  ...selectProps
}: Props<T>) {
  // Auto-add nullDisplayValue to options if provided
  const finalOptions = nullDisplayValue ? [nullDisplayValue, ...options] : options

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ErrorMessage errorMsg={fieldState.error?.message}>
          <Select
            options={finalOptions}
            onValueChange={value => {
              // Convert "No [something]" back to null
              if (nullDisplayValue && value === nullDisplayValue) {
                field.onChange(null)
              } else {
                field.onChange(value)
              }
            }}
            onBlur={field.onBlur}
            value={field.value === null && nullDisplayValue ? nullDisplayValue : field.value}
            {...selectProps}
          />
        </ErrorMessage>
      )}
    />
  )
}
