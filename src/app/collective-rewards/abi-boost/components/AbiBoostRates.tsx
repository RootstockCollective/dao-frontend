import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { LoadingSpinner } from '@/components/LoadingSpinner'

import { formatRate, getBoostedRate } from '../abiBoost.utils'

interface RateProps {
  className?: string
  'data-testid'?: string
}

export const CurrentAbiRate = ({ className, 'data-testid': dataTestId = 'CurrentAbiRate' }: RateProps) => (
  <AnnualBackerIncentivesLoader
    render={({ data, isLoading }) =>
      isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <span className={className} data-testid={dataTestId}>
          {formatRate(data)}
        </span>
      )
    }
  />
)

export const BoostedRate = ({ className, 'data-testid': dataTestId = 'BoostedRate' }: RateProps) => (
  <AnnualBackerIncentivesLoader
    render={({ data, isLoading }) =>
      isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <span className={className} data-testid={dataTestId}>
          {formatRate(getBoostedRate(data))}
        </span>
      )
    }
  />
)
