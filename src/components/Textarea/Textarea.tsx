import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, InputHTMLAttributes, JSX } from 'react'

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
  onChange: (value: string) => void
  name: string
  fullWidth?: boolean
  value?: string
  placeholder?: string
  label?: string
  labelWrapperProps?: JSX.IntrinsicElements['div']
  inputProps?: JSX.IntrinsicElements['textarea']
  errorMessage?: string
  className?: string
}
export const Textarea: FC<Props> = ({
  onChange,
  name,
  fullWidth = false,
  value,
  placeholder,
  label,
  labelWrapperProps = {},
  inputProps = {},
  errorMessage,
  className,
}) => {
  const handleOnChange = (e: { target: { value: string } }) => onChange(e.target.value)

  const classes = cn({
    [DEFAULT_CLASSES]: true,
    'w-full': fullWidth,
    'border-st-error': errorMessage,
  })
  return (
    <div className={className}>
      {label && (
        <div className="pb-[10px]" {...labelWrapperProps}>
          <Label variant="semibold">{label}</Label>
        </div>
      )}
      <textarea
        className={classes}
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
        name={name}
        data-testid={name}
        rows={10}
        {...inputProps}
      />
      {errorMessage && (
        <div className="text-st-error mt-[5px]">
          <Paragraph variant="light" className="text-[14px]">
            {errorMessage}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
