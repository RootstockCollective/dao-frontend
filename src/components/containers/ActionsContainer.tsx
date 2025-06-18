import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionsContainerProps = CommonComponentProps & {
  title?: ReactNode
}

export const ActionsContainer: FC<ActionsContainerProps> = ({ title, children, className = '' }) => {
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
      <div data-testid="content" className="flex flex-col items-start gap-4">
        {children}
      </div>
    </div>
  )
}
