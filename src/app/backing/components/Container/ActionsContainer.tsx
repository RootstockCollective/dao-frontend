import { cn } from '@/lib/utils'
import { FC, PropsWithChildren } from 'react'
import { CommonComponentProps } from '../commonProps'

export type ActionsContainerProps = CommonComponentProps & PropsWithChildren

export const ActionsContainer: FC<ActionsContainerProps> = ({ dataTestid, className = '', children }) => {
  return (
    <div
      data-testid={`${dataTestid}_ActionsContainer`}
      className={cn('flex flex-col w-[71.5rem] gap-2 rounded-sm', className)}
    >
      <div data-testid={`${dataTestid}_Actions`} className={cn('flex flex-col p-6 pt-4 items-center gap-10')}>
        {children}
      </div>
    </div>
  )
}
