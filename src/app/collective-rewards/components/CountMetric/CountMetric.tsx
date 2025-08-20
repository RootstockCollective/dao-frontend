import { Metric } from '@/components/Metric'
import { BaseTypography } from '@/components/Typography/Typography'
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
    <Metric className="text-v3-text-0" title={<BaseTypography variant="body">{title}</BaseTypography>}>
      {isLoading ? <LoadingSpinner size="small" /> : <Header>{children}</Header>}
    </Metric>
  )
}
