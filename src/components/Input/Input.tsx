import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, JSX } from 'react'
import { InputAttributes, NumericFormatProps } from 'react-number-format'
import { InputNumber } from './InputNumber'
import { BsSearch, BsXCircle } from 'react-icons/bs'
import { FaSpinner } from 'react-icons/fa6'

const DEFAULT_CLASSES = `
px-[20px] py-[12px]
text-black bg-input-bg
text-text-primary
rounded-[6px]
border-[1px]
border-[rgb(45,45,45)]
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
  hint?: string | JSX.Element
  errorMessage?: string
  className?: string
  type?: InputType
  onChange?: (value: string) => void
  labelProps?: JSX.IntrinsicElements['div']
  /**
   * Adds a "clear" button to the search field. The provided function is called when the button is clicked.
   */
  onClear?: () => void
  /**
   * Loading prop triggers rolling spinner inside the search field
   */
  loading?: boolean
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
  onClear,
  loading = false,
}) => {
  const { className: inputClasses, ...restInputProps } = inputProps
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
        className={cn(classes, inputClasses)}
        placeholder={placeholder}
        value={value}
        onValueChange={({ value }) => onChange(value)}
        name={name}
        data-testid={`Input_${name}`}
        readOnly={readonly}
        {...restInputProps}
      />
    ),
    text: (
      <input
        className={cn(classes, inputClasses)}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={handleOnChange}
        name={name}
        data-testid={`Input_${name}`}
        readOnly={readonly}
        {...restInputProps}
      />
    ),
    search: (
      <div className="relative">
        <div className="absolute translate-y-4 translate-x-4">
          {loading ? <FaSpinner className="animate-spin" /> : <BsSearch data-testid="SearchIcon" />}
        </div>
        <input
          className={cn(classes, inputClasses, onClear && 'pr-[38px]')}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={handleOnChange}
          name={name}
          data-testid={`Input_${name}`}
          readOnly={readonly}
          autoComplete="off"
          {...restInputProps}
        />
        {/* Small clear button at the right of the search field */}
        {onClear && (
          <button onClick={onClear} className="absolute right-4 bottom-1/2 translate-y-1/2 cursor-pointer">
            <BsXCircle data-testid="ClearIcon" />
          </button>
        )}
      </div>
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
