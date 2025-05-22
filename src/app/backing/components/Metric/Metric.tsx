import { FC, ReactNode } from 'react'
import { TestableComponentProps } from '../commonProps'
import { MetricContent } from './MetricContent'
import { MetricTitleText } from './MetricTitleText'

export type MetricProps = TestableComponentProps & {
  title: ReactNode
  content: ReactNode
}

export const Metric: FC<MetricProps> = ({ dataTestId, title, content }) => {
  const isTitleTextual = typeof title === 'string'
  const isContentTextual = typeof title === 'string'

  return (
    <div data-testid={`${dataTestId}_Metric`} className="flex flex-col items-start gap-2 self-stretch">
      {isTitleTextual ? <MetricTitleText text={title} dataTestId={dataTestId} /> : title}
      {isContentTextual ? <MetricContent dataTestId={dataTestId}>{content}</MetricContent> : content}
    </div>
  )
}
