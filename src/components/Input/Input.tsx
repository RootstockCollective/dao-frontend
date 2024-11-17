import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, JSX } from 'react'
import { InputAttributes, NumericFormatProps } from 'react-number-format'
import { InputNumber } from './InputNumber'
import { BsSearch } from 'react-icons/bs'

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

export type InputType = 'text' | 'number' | 'search'
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
  type?: InputType
  onChange?: (value: string) => void
  labelProps?: JSX.IntrinsicElements['div']
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
  labelProps = {},
}) => {
  const handleOnChange = (e: { target: { value: string } }) => onChange(e.target.value)

  const classes = cn({
    [DEFAULT_CLASSES]: true,
    'w-full': fullWidth,
    'border-st-error': errorMessage,
    'text-text-secondary focus-visible:ring-0': readonly,
    'pl-12': type === 'search',
  })

  const input = {
    number: (
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
    ),
    text: (
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
    ),
    search: (
      <>
        <BsSearch className="absolute translate-y-4 translate-x-4" />
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
      </>
    ),
  }[type]
  return (
    <div className={className} data-testid={`Input_Container_${name}`}>
      {label && (
        <div className="pb-[10px]" {...labelWrapperProps}>
          <Label variant="semibold" {...labelProps}>
            {label}
          </Label>
        </div>
      )}
      {input}
      {hint && !errorMessage && (
        <div className="text-st-hint mt-[5px]">
          <Paragraph variant="light" className="text-[14px]">
            {hint}
          </Paragraph>
        </div>
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
