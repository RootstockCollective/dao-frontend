import { FC, ReactNode } from 'react'
import { Header } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { CommonComponentProps } from '../../commonProps'

export interface ActionsContainerProps extends CommonComponentProps {
  children: ReactNode
  title?: ReactNode
}

export const ActionsContainer: FC<ActionsContainerProps> = ({ className = '', children, title }) => {
  return (
    <div
      data-testid="ActionsContainer"
      className={cn('flex flex-col w-full gap-10 p-6 rounded-sm bg-v3-bg-accent-80', className)}
    >
      <div data-testid="ActionsContainerTitle" className="flex w-full justify-between items-center">
        <Header variant="h3">{title}</Header>
      </div>
      <div data-testid="ActionsContainerContent">{children}</div>
    </div>
  )
}
