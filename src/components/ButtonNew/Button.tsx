import { cn } from '@/lib/utils'
import { FC, ButtonHTMLAttributes } from 'react'
import { Span } from '../TypographyNew'

type ButtonVariant = 'primary' | 'secondary'

const DEFAULT_CLASSES =
  'relative overflow-hidden px-6 py-2 rounded-md font-bold text-base transition-all duration-150 flex items-center justify-center gap-2'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  'data-testid'?: string
}

export const Button: FC<Props> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  'data-testid': dataTestId,
  ...props
}) => {
  const styles = {
    primary: 'bg-primary text-bg-100 disabled:bg-disabled-primary',
    secondary: 'bg-bg-100 text-text-100 border-0 disabled:opacity-80',
  }

  return (
    <button
      type="button"
      className={cn(DEFAULT_CLASSES, styles[variant], className)}
      onClick={e => !disabled && onClick?.(e)}
      disabled={disabled}
      data-testid={dataTestId}
      // All props must be forwarded to the underlying component to ensure that wrapping components (like Tooltip) function correctly.
      {...props}
    >
      <Span bold>{children}</Span>
    </button>
  )
}
