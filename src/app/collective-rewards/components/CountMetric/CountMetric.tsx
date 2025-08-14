import { Metric } from '@/components/Metric'
import { Header } from '@/components/Typography'
import { FC } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CommonComponentProps } from '@/components/commonProps'

interface CountMetricProps extends CommonComponentProps {
  title: string
  isLoading: boolean
}
export const CountMetric: FC<CountMetricProps> = ({ title, children, isLoading }) => {
  return (
    <Metric
      className="text-v3-text-0"
      title={
        <Header variant="h1" className="text-v3-bg-accent-40">
          {title}
        </Header>
      }
    >
      {isLoading ? <LoadingSpinner size="small" /> : <Header>{children}</Header>}
    </Metric>
  )
}
