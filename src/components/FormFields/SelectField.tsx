import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import { Select, type SelectProps } from '@/components/Select'
import { ErrorMessage } from './ErrorMessage'

interface Props<T extends FieldValues> extends Omit<SelectProps, 'onValueChange' | 'onBlur' | 'value'> {
  name: FieldPath<T>
  control: Control<T>
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  options = [],
  ...selectProps
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ErrorMessage errorMsg={fieldState.error?.message}>
          <Select
            options={options}
            onValueChange={value => {
              field.onChange(value)
            }}
            onBlur={field.onBlur}
            value={field.value}
            {...selectProps}
          />
        </ErrorMessage>
      )}
    />
  )
}
