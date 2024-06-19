import { ReactNode, FC } from 'react'
import { ButtonTypes, ButtonVariants } from '@/components/Button/types'

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
  const classes = [
    BUTTON_DEFAULT_CLASSES,
    fullWidth && 'w-full',
    type === ButtonTypes.Circle && 'rounded-full',
    type === ButtonTypes.Square && 'rounded-[4px]',
    variant === ButtonVariants.White && 'bg-white',
    startIcon && 'pl-9',
  ].join(' ')
  
  const textClasses = [
    'font-bold relative',
    variant === ButtonVariants.White && 'text-black'
  ].join(' ')
  
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