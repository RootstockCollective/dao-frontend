import { Metric } from '@/components/Metric'
import { Header, Label } from '@/components/Typography'
import { FC } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CommonComponentProps } from '@/components/commonProps'

interface CountMetricProps extends CommonComponentProps {
  title: string
  isLoading: boolean
}
export const CountMetric: FC<CountMetricProps> = ({ title, children, isLoading }) => {
  return (
    <Metric className="text-v3-text-0" title={<Label className="text-v3-bg-accent-60">{title}</Label>}>
      {isLoading ? <LoadingSpinner size="small" /> : <Header>{children}</Header>}
    </Metric>
  )
}
