import { FC, ReactNode } from 'react'
import { ButtonTypes, ButtonVariants } from '@/components/Button/types'
import classnames from 'classnames'

export const BUTTON_DEFAULT_CLASSES = 'px-[24px] py-[20px] border-[1px] border-white flex gap-x-1 justify-center items-center relative'

interface Props {
  text: string
  onClick: () => void
  startIcon?: ReactNode
  type?: ButtonTypes
  variant?: ButtonVariants
  fullWidth?: boolean
}


export const Button: FC<Props> = ({
  text,
  onClick,
  startIcon,
  type = ButtonTypes.Square,
  variant = ButtonVariants.Square,
  fullWidth = false,
                                  }) => {
  const classes = classnames({
    [BUTTON_DEFAULT_CLASSES]: true,
    'w-full': fullWidth,
    'rounded-full': type === ButtonTypes.Circle,
    'rounded-[4px]': type === ButtonTypes.Square,
    'bg-white': variant === ButtonVariants.White,
    'pl-9': startIcon,
    
  })
  
  const textClasses = classnames({
    'font-bold relative': true,
    'text-black': variant === ButtonVariants.White
  })
  
  return (
    <button
      type='button'
      className={classes}
      onClick={onClick}
    >
      <span className={textClasses}><span className='absolute left-[-20px] top-[4px]'>{startIcon}</span>{text.toUpperCase()}</span>
    </button>
  )
}
