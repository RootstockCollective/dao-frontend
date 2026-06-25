import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { Header, Label } from '@/components/Typography'

interface CountMetricProps extends CommonComponentProps {
  title: string
  isLoading: boolean
  onClick?: () => void
}
export const CountMetric = ({ title, children, isLoading, onClick }: CountMetricProps) => {
  return (
    <Metric
      className="text-v3-text-0 items-start"
      title={<Label className="text-v3-bg-accent-40">{title}</Label>}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <Header
          className={`text-xl md:text-[2rem] ${onClick ? 'cursor-pointer hover:underline' : ''}`}
          onClick={onClick}
        >
          {children}
        </Header>
      )}
    </Metric>
  )
}
