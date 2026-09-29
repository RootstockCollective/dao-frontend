import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { LoadingSpinner } from '@/components/LoadingSpinner'

import { formatRate, getBoostedRate } from '../abiBoost.utils'

interface RateProps {
  className?: string
  'data-testid'?: string
}

/** The Collective's current ABI, as the base the boost is added to. */
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

/** The rate a boosted backing earns, computed from the current ABI every time it renders. */
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
