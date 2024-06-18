import { ReactNode, FC } from 'react'

export enum TYPES {
  Square = 'Square',
  Circle = 'Circle'
}

export enum VARIANTS {
  Square = 'Square',
  White = 'White'
}

interface Props {
  text: string
  onClick: () => void
  startIcon?: ReactNode
  type?: TYPES
  variants?: VARIANTS
  fullWidth?: boolean
}

export const BUTTON_DEFAULT_CLASSES = 'px-5 py-3 border-2 border-white flex gap-x-2 items-center justify-center'

export const Button: FC<Props> = ({
  text,
  onClick,
  startIcon,
  type = TYPES.Square,
  variants = VARIANTS.Square,
  fullWidth = false,
                                  }) => {
  const classes = [
    BUTTON_DEFAULT_CLASSES,
    fullWidth && 'w-full',
    type === TYPES.Circle && 'rounded-full',
    type === TYPES.Square && 'rounded',
    variants === VARIANTS.White && 'bg-white'
  ].join(' ')
  
  const textClasses = [
    'font-bold',
    variants === VARIANTS.White && 'text-black'
  ].join(' ')
  
  return (
    <button type='button' className={classes} onClick={onClick}>
      <span>{startIcon}</span><span className={textClasses}>{text.toUpperCase()}</span>
    </button>
  )
}