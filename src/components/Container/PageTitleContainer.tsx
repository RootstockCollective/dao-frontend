import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'
import { H1 } from '../H/H1'

export type PageTitleContainerProps =
  | (CommonComponentProps & {
      children: React.ReactNode
      leftText?: never
      rightText?: never
    })
  | (CommonComponentProps & {
      children?: never
      leftText: string
      rightText?: string
    })

const ContainerCompnent: FC<PageTitleContainerProps> = ({ className = '', children }) => (
  <div data-testid={'PageTitleContainer'} className={cn('flex w-full', className)}>
    {children}
  </div>
)

export const PageTitleContainer: FC<PageTitleContainerProps> = ({
  leftText,
  rightText,
  className = '',
  children,
}) => {
  if (children) {
    return <ContainerCompnent {...{ className, children }} />
  }

  return (
    <div data-testid={'PageTitleContainer'} className={cn('flex h-10 pr-[36.19rem] items-center', className)}>
      <H1 data-testid={'PageTitleContainerLeft'}>
        {leftText} {/* FIXME: adopt Typography from DAO@koto */}
      </H1>

      <h2 className="grow uppercase text-right" data-testid={'PageTitleContainerRight'}>
        {rightText} {/* FIXME: adopt Typography from DAO@koto */}
      </h2>
    </div>
  )
}
