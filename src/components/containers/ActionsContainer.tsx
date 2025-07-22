import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionsContainerProps = CommonComponentProps & {
  title?: ReactNode
  containerClassName?: string
}

export const ActionsContainer: FC<ActionsContainerProps> = ({
  title,
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div
      data-testid="ActionsContainer"
      className={cn('flex flex-col w-full gap-10 p-6 rounded-sm', className)}
    >
      {title && (
        <div data-testid="title" className="flex w-full justify-between items-center">
          {title}
        </div>
      )}
      <div data-testid="content" className={cn('flex flex-col items-start gap-4', containerClassName)}>
        {children}
      </div>
    </div>
  )
}
