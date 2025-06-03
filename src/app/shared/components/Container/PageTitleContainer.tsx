import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'
import { Typography } from '@/components/TypographyNew/Typography'

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
      <Typography as="h1" variant="h1" data-testid={'PageTitleContainerLeft'}>
        {leftText}
      </Typography>

      <Typography
        as="h2"
        variant="h2"
        className="grow uppercase text-right"
        data-testid={'PageTitleContainerRight'}
      >
        {rightText}
      </Typography>
    </div>
  )
}
