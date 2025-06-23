import { ButtonVariants } from './types'
import { cn } from '@/lib/utils'
import { FC, JSX, MouseEvent, ReactNode } from 'react'
import { Span } from '../Typography'
import { SpinnerIcon } from '../Icons'

export const BUTTON_DEFAULT_CLASSES = 'px-[23px] py-[9px] flex gap-x-1 items-center relative rounded-[6px]'

const DEFAULT_PAGINATION_CLASSES = 'w-[32px] h-[32px] p-0'

const DEFAULT_PAGINATION_ACTIVE_CLASSES = [DEFAULT_PAGINATION_CLASSES, 'bg-primary text-black'].join(' ')

interface Props {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  startIcon?: ReactNode
  variant?: ButtonVariants
  fullWidth?: boolean
  centerContent?: boolean
  disabled?: boolean
  className?: string
  textClassName?: string
  buttonProps?: JSX.IntrinsicElements['button'] & { 'data-testid'?: string }
  loading?: boolean
  startIconClasses?: string
  'data-testid'?: string
}
export type ButtonProps = Props

const DEFAULT_DATA_TESTID = 'Button'

/**
 * @deprecated Use `ButtonNew` instead.
 * @param text
 * @param onClick
 * @param startIcon
 * @param variant
 * @param fullWidth
 * @param centerContent
 * @param disabled
 * @param className
 * @param textClassName
 * @param buttonProps
 * @param loading
 * @param startIconClasses
 * @param dataTestId
 * @constructor
 */
export const Button: FC<Props> = ({
  children: text,
  onClick,
  startIcon,
  variant = 'primary',
  fullWidth = false,
  centerContent = true,
  disabled = false,
  className = '',
  textClassName = '',
  buttonProps = {},
  loading = false,
  startIconClasses,
  'data-testid': dataTestId,
}) => {
  startIcon = loading ? <SpinnerIcon className="animate-spin" /> : startIcon
  const classes = cn({
    [BUTTON_DEFAULT_CLASSES]: true,
    'bg-primary rounded-[6px]': variant === 'primary',
    'bg-primary rounded-[6px] h-[56px]': variant === 'primary-new',
    'bg-transparent border-secondary rounded-[6px] border': variant === 'secondary',
    'bg-secondary border-secondary rounded-[6px] border': variant === 'secondary-full',
    'bg-white rounded-[6px] border': variant === 'white',
    'bg-white rounded-[6px] border h-[56px]': variant === 'white-new',
    'bg-disabled-primary': disabled && variant === 'primary',
    'rounded-[6px] border-0': disabled,
    'border-0': variant === 'borderless',
    'border border-[#2D2D2D] rounded-[6px]': variant === 'outlined',
    'w-full': fullWidth,
    'pl-9': startIcon,
    'justify-start': !centerContent,
    'justify-center': centerContent,
    'cursor-not-allowed': disabled,
    [DEFAULT_PAGINATION_CLASSES]: variant === 'pagination',
    [DEFAULT_PAGINATION_ACTIVE_CLASSES]: variant === 'pagination-active',
    [className]: true,
  })

  const textClasses = cn({
    'font-rootstock-sans': true,
    'font-bold relative': true,
    'text-white': true,
    'text-secondary': disabled,
    'font-normal text-[rgba(255,255,255,0.8)]': variant === 'borderless',
    'text-black': ['white', 'white-new'].includes(variant),
    [textClassName]: true,
  })

  return (
    <button
      type="button"
      className={classes}
      onClick={e => !disabled && onClick?.(e)}
      {...buttonProps}
      data-testid={`${DEFAULT_DATA_TESTID}${dataTestId || buttonProps['data-testid'] || ''}${buttonProps.id || ''}`}
    >
      <span className={textClasses}>
        <span className={cn('absolute left-[-20px] top-[4px]', startIconClasses)}>{startIcon}</span>
        <Span className={textClassName}>{text}</Span>
      </span>
    </button>
  )
}
