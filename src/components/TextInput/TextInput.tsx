import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, JSX } from 'react'

const DEFAULT_CLASSES = `
px-[20px] py-[12px]
text-black bg-input-bg
text-text-primary
rounded-[6px]
border-[1px]
border-[white]/[0.10]
placeholder:text-input-placeholder
focus:outline-none
`

interface Props {
  onChange: (value: string) => void
  name: string
  fullWidth?: boolean
  value?: string
  placeholder?: string
  defaultValue?: string
  label?: string
  labelWrapperProps?: JSX.IntrinsicElements['div']
  inputProps?: JSX.IntrinsicElements['input']
  errorMessage?: string
}
export const TextInput: FC<Props> = ({
  onChange,
  name,
  fullWidth = false,
  value,
  defaultValue = '',
  placeholder,
  label,
  labelWrapperProps = {},
  inputProps = {},
  errorMessage,
}) => {
  const handleOnChange = (e: { target: { value: string } }) => onChange(e.target.value)

  const classes = cn({
    [DEFAULT_CLASSES]: true,
    'w-full': fullWidth,
    'border-st-error': errorMessage,
  })
  return (
    <>
      {label && (
        <div className="pb-[10px]" {...labelWrapperProps}>
          <Label>{label}</Label>
        </div>
      )}
      <input
        className={classes}
        placeholder={placeholder}
        type="text"
        value={value}
        defaultValue={defaultValue}
        onChange={handleOnChange}
        name={name}
        data-testid={name}
        {...inputProps}
      />
      {errorMessage && (
        <div className="text-st-error mt-[5px]">
          <Paragraph variant="light" className="text-[14px]">
            {errorMessage}
          </Paragraph>
        </div>
      )}
    </>
  )
}
