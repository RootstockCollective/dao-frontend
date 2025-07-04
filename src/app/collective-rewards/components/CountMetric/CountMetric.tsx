import { Metric } from '@/components/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { Header } from '@/components/TypographyNew'
import { FC } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CommonComponentProps } from '@/components/commonProps'

interface CountMetricProps extends CommonComponentProps {
  title: string
  isLoading: boolean
}
export const CountMetric: FC<CountMetricProps> = ({ title, children, isLoading }) => {
  return (
    <Metric className="text-v3-text-0" title={<Typography variant="body">{title}</Typography>}>
      {isLoading ? <LoadingSpinner size="small" /> : <Header>{children}</Header>}
    </Metric>
  )
}
