import { cn } from '@/lib/utils'
import { FC, ButtonHTMLAttributes } from 'react'
import { Span } from '../TypographyNew'

type ButtonVariant = 'primary' | 'secondary' | 'secondary-outline'

const DEFAULT_CLASSES =
  'relative overflow-hidden px-4 py-2 rounded-sm font-bold text-base transition-all duration-150 flex items-center justify-center disabled:cursor-not-allowed'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  'data-testid'?: string
}

export const Button: FC<Props> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className,
  'data-testid': dataTestId,
  ...props
}) => {
  const styles = {
    primary:
      'bg-primary text-bg-100 border border-primary disabled:bg-disabled-primary disabled:border-transparent',
    secondary:
      'bg-bg-100 text-text-100 border border-bg-100 disabled:opacity-80 disabled:border-disabled-primary disabled:border-opacity-80',
    'secondary-outline':
      'bg-transparent text-text-100 border border-bg-0 disabled:opacity-50 disabled:border-disabled-primary disabled:border-opacity-50',
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
      {typeof children === 'string' ? <Span bold>{children}</Span> : children}
    </button>
  )
}
