import { Button } from '@/components/Button'
import { TransactionInProgressButton } from './TransactionInProgressButton'
import { useStakingContext } from '../StakingContext'

export const StepActionButtons = () => {
  const {
    buttonActions: { primary, secondary },
  } = useStakingContext()

  return (
    <div className="flex flex-col gap-4 mt-8 md:flex-row md:items-center md:justify-end">
      <div className="flex gap-4">
        {secondary && (
          <Button
            variant="secondary-outline"
            onClick={secondary.onClick}
            data-testid={secondary.label}
            disabled={secondary.disabled || primary.loading || primary.isTxPending}
          >
            {secondary.label}
          </Button>
        )}
        {primary.isTxPending ? (
          <TransactionInProgressButton />
        ) : (
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={primary.onClick}
            data-testid={primary.label}
            disabled={primary.disabled || primary.loading}
          >
            {primary.label}
          </Button>
        )}
      </div>
    </div>
  )
}
