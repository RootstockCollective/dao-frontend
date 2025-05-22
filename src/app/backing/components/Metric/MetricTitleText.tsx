import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export type MetricTitleTextProps = CommonComponentProps<HTMLDivElement> & {
  text: ReactNode
}
export const MetricTitleText: FC<MetricTitleTextProps> = ({ text, dataTestId }) => {
  return (
    <div
      data-testid={`${dataTestId}_MetricTitleText`}
      className="font-rootstock-sans text-base font-medium not-italic grow"
    >
      {text}
    </div>
  )
}
