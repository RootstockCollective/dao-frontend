import { ReactNode, FC } from 'react'
import { ButtonTypes, ButtonVariants } from '@/components/Button/types'

export const BUTTON_DEFAULT_CLASSES = 'px-5 py-3 border-2 border-white flex gap-x-2 items-center justify-center'

interface Props {
  text: string
  onClick: () => void
  startIcon?: ReactNode
  type?: ButtonTypes
  variants?: ButtonVariants
  fullWidth?: boolean
}


export const Button: FC<Props> = ({
  text,
  onClick,
  startIcon,
  type = ButtonTypes.Square,
  variants = ButtonVariants.Square,
  fullWidth = false,
                                  }) => {
  const classes = [
    BUTTON_DEFAULT_CLASSES,
    fullWidth && 'w-full',
    type === ButtonTypes.Circle && 'rounded-full',
    type === ButtonTypes.Square && 'rounded',
    variants === ButtonVariants.White && 'bg-white'
  ].join(' ')
  
  const textClasses = [
    'font-bold',
    variants === ButtonVariants.White && 'text-black'
  ].join(' ')
  
  return (
    <button type='button' className={classes} onClick={onClick}>
      <span>{startIcon}</span><span className={textClasses}>{text.toUpperCase()}</span>
    </button>
  )
}