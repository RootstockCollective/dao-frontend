import { FC } from 'react'
import { Button, ButtonProps } from '.'
import { cn } from '@/lib/utils'

export const HeaderButton: FC<ButtonProps> = ({ className, children, ...buttonProps }) => {
  return (
    <Button className={cn('h-12 whitespace-nowrap', className)} {...buttonProps}>
      {children}
    </Button>
  )
}
