import { Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export type PageTitleContainerProps = CommonComponentProps & {
  left: ReactNode
  right?: ReactNode
}

export const PageTitleContainer: FC<PageTitleContainerProps> = ({
  left,
  right = '',
  dataTestid,
  className = '',
}) => {
  const isLeftText = typeof left === 'string'
  const isRightText = typeof right === 'string'

  return (
    <div data-testid={`${dataTestid}_PageTitleContainer`} className={cn('flex w-full', className)}>
      {!isLeftText && left}
      {isLeftText && (
        <Typography className="grow uppercase" data-testid={`${dataTestid}_PageTitleContainerLeft`}>
          {left} {/* FIXME: adopt Typography from DAO@koto */}
        </Typography>
      )}

      {!isRightText && right}
      {isRightText && (
        <Typography className="grow uppercase" data-testid={`${dataTestid}_PageTitleContainerRight`}>
          {right} {/* FIXME: adopt Typography from DAO@koto */}
        </Typography>
      )}
    </div>
  )
}
