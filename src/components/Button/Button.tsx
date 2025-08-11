import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, FC, RefAttributes } from 'react'
import { Span } from '../TypographyNew'

type ButtonVariant = 'primary' | 'secondary' | 'secondary-outline' | 'transparent'

const DEFAULT_CLASSES =
  'relative overflow-hidden px-4 py-2 rounded-sm font-bold text-base transition-all duration-150 flex items-center justify-center disabled:cursor-not-allowed'

interface Props extends RefAttributes<HTMLButtonElement>, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  'data-testid'?: string
  textClassName?: string
}

export const Button: FC<Props> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className,
  'data-testid': dataTestId,
  textClassName = '',
  ...props
}) => {
  const styles = {
    primary:
      'bg-primary text-bg-100 border border-primary disabled:bg-disabled-primary disabled:border-transparent',
    secondary:
      'bg-bg-100 text-text-100 border border-bg-100 disabled:opacity-80 disabled:border-disabled-primary disabled:border-opacity-80',
    'secondary-outline':
      'bg-transparent text-text-100 border border-bg-0 disabled:opacity-50 disabled:border-disabled-primary disabled:border-opacity-50',
    transparent:
      'bg-transparent text-text-100 border-none disabled:opacity-50 disabled:border-disabled-primary disabled:border-opacity-50',
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
      {typeof children === 'string' ? (
        <Span className={textClassName} bold>
          {children}
        </Span>
      ) : (
        children
      )}
    </button>
  )
}

export type ButtonProps = Props
