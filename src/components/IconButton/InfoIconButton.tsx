import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { Popover, PopoverProps } from '../Popover'

export interface InfoIconButtonProps extends Omit<PopoverProps, 'children'> {
  className?: string
  popoverClassName?: string
}

export const InfoIconButton: FC<InfoIconButtonProps> = ({ className, popoverClassName, ...props }) => {
  return (
    <div data-testid="InfoIconButton" className={cn('pt-1 items-center flex gap-2', className)}>
      <Popover
        trigger="hover"
        size="medium"
        position="left"
        background="light"
        className={popoverClassName}
        {...props}
      >
        <KotoQuestionMarkIcon />
      </Popover>
    </div>
  )
}
