import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, JSX } from 'react'
import { InputAttributes, NumericFormatProps } from 'react-number-format'
import { InputNumber } from './InputNumber'

const DEFAULT_CLASSES = `
px-[20px] py-[12px]
text-black bg-input-bg
text-text-primary
rounded-[6px]
border-[1px]
border-[white]/[0.10]
placeholder:text-input-placeholder
focus:outline-none
focus-visible:ring-1 focus-visible:ring-ring
focus-visible:ring-white focus-visible:ring-opacity-50
`

interface Props {
  name: string
  fullWidth?: boolean
  value?: string
  placeholder?: string
  readonly?: boolean
  label?: string
  labelWrapperProps?: JSX.IntrinsicElements['div']
  inputProps?: JSX.IntrinsicElements['input'] & NumericFormatProps<InputAttributes>
  hint?: string
  errorMessage?: string
  className?: string
  type?: 'text' | 'number'
  onChange?: (value: string) => void
}
export const Input: FC<Props> = ({
  name,
  fullWidth = false,
  value,
  placeholder,
  readonly = false,
  label,
  labelWrapperProps = {},
  inputProps = {},
  hint,
  errorMessage,
  className,
  type = 'text',
  onChange = () => {},
}) => {
  const handleOnChange = (e: { target: { value: string } }) => onChange(e.target.value)

  const classes = cn({
    [DEFAULT_CLASSES]: true,
    'w-full': fullWidth,
    'border-st-error': errorMessage,
    'text-text-secondary focus-visible:ring-0': readonly,
  })
  return (
    <div className={className} data-testid={`Input_Container_${name}`}>
      {label && (
        <div className="pb-[10px]" {...labelWrapperProps}>
          <Label variant="semibold">{label}</Label>
        </div>
      )}
      {type === 'number' ? (
        <InputNumber
          className={classes}
          placeholder={placeholder}
          value={value}
          onValueChange={({ value }) => onChange(value)}
          name={name}
          data-testid={`Input_${name}`}
          readOnly={readonly}
          {...inputProps}
        />
      ) : (
        <input
          className={classes}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={handleOnChange}
          name={name}
          data-testid={`Input_${name}`}
          readOnly={readonly}
          {...inputProps}
        />
      )}
      {hint && !errorMessage && (
        <div className="text-st-hint mt-[5px]">
          <Paragraph variant="light" className="text-[14px]">
            {hint}
          </Paragraph>
        </div>
      )}
      {errorMessage && (
        <div className="mt-[5px]">
          <Paragraph variant="error" className="text-[14px]">
            {errorMessage}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
