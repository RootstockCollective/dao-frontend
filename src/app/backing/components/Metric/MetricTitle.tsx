import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Popover } from '@/components/Popover'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'
import { MetricTitleText } from './MetricTitleText'

export type MetricTitleProps = CommonComponentProps & {
  title: ReactNode
  info: ReactNode
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, dataTestId, className = '' }) => {
  const isTitleTextual = typeof title === 'string'
  const isInfoTextual = typeof info === 'string'

  return (
    <div
      data-testid={`${dataTestId}_MetricTitle`}
      className={cn('flex w-[14.5rem] items-start gap-2', className)}
    >
      {!isTitleTextual && title}
      {isTitleTextual && <MetricTitleText text={title} dataTestId={dataTestId} />}

      {!isInfoTextual && info}
      {isInfoTextual && (
        <div data-testid={`${dataTestId}_MetricTitleIcon`} className="pt-1 items-center flex gap-2">
          <Popover content={info} trigger="hover" size="small">
            <KotoQuestionMarkIcon />
          </Popover>
        </div>
      )}
    </div>
  )
}
