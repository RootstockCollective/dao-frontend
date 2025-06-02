import { cn } from '@/lib/utils'
import { FC, PropsWithChildren, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionsContainerProps = CommonComponentProps &
  PropsWithChildren & {
    title: ReactNode
  }

export const ActionsContainer: FC<ActionsContainerProps> = ({
  dataTestid,
  title,
  children,
  className = '',
}) => {
  return (
    <div
      data-testid={`${dataTestid}_ActionsContainer`}
      className={cn('flex flex-col w-full gap-10 p-6 rounded-sm bg-v3-bg-accent-80', className)}
    >
      <div
        data-testid={`${dataTestid}_ActionsContainerTitle`}
        className="flex w-full justify-between items-center"
      >
        {title}
      </div>
      <div data-testid={`${dataTestid}_ActionsContainerContent`} className="flex flex-col items-start gap-4">
        {children}
      </div>
    </div>
  )
}
