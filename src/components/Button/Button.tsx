import { ButtonVariants } from '@/components/Button/types'
import { cn } from '@/lib/utils'
import { FC, JSX, MouseEvent, ReactNode } from 'react'

export const BUTTON_DEFAULT_CLASSES = 'px-[24px] py-[12px] flex gap-x-1 items-center relative'

interface Props {
  children: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  startIcon?: ReactNode
  variant?: ButtonVariants
  fullWidth?: boolean
  centerContent?: boolean
  className?: string
  textClassName?: string
  buttonProps?: JSX.IntrinsicElements['button']
}

export const Button: FC<Props> = ({
  children: text,
  onClick,
  startIcon,
  variant = 'primary',
  fullWidth = false,
  centerContent = true,
  className = '',
  textClassName = '',
  buttonProps = {},
}) => {
  const classes = cn({
    [BUTTON_DEFAULT_CLASSES]: true,
    'bg-primary rounded-[6px]': variant === 'primary',
    'bg-transparent border-secondary rounded-[6px] border-[1px]': variant === 'secondary',
    'bg-disabled-primary rounded-[6px]': variant === 'disabled',
    'border-0': variant === 'transparent',
    'w-full': fullWidth,
    'pl-9': startIcon,
    'justify-start': !centerContent,
    'justify-center': centerContent,
    [className]: true,
  })

  const textClasses = cn({
    'font-bold relative': true,
    'text-secondary': variant === 'secondary',
    'text-disabled-secondary': variant === 'disabled',
    'font-normal text-[rgba(255,255,255,0.8)]': variant === 'transparent',
    [textClassName]: true,
  })

  return (
    <button type="button" className={classes} onClick={onClick} {...buttonProps}>
      <span className={textClasses}>
        <span className="absolute left-[-20px] top-[4px]">{startIcon}</span>
        {text}
      </span>
    </button>
  )
}
