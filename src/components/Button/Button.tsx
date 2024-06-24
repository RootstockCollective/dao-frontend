import { FC, ReactNode } from 'react'
import { ButtonVariants } from '@/components/Button/types'
import classnames from 'classnames'

export const BUTTON_DEFAULT_CLASSES = 'px-[24px] py-[12px] flex gap-x-1 justify-center items-center relative'

interface Props {
  text: string
  onClick: () => void
  startIcon?: ReactNode
  variant?: ButtonVariants
  fullWidth?: boolean
}


export const Button: FC<Props> = ({
  text,
  onClick,
  startIcon,
  variant = 'primary',
  fullWidth = false,
                                  }) => {
  const classes = classnames({
    [BUTTON_DEFAULT_CLASSES]: true,
    'bg-primary rounded-[6px]': variant === 'primary',
    'bg-transparent border-secondary rounded-[6px] border-[1px]': variant === 'secondary',
    'bg-disabled-primary rounded-[6px]': variant === 'disabled',
    'w-full': fullWidth,
    'pl-9': startIcon,
    
  })
  
  const textClasses = classnames({
    'font-bold relative': true,
    'text-secondary': variant === 'secondary',
    'text-disabled-secondary': variant === 'disabled',
  })
  
  return (
    <button
      type='button'
      className={classes}
      onClick={onClick}
    >
      <span className={textClasses}><span className='absolute left-[-20px] top-[4px]'>{startIcon}</span>{text}</span>
    </button>
  )
}
