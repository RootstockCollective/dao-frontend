import { Button } from '@/components/Button'
import { TransactionInProgressButton } from './TransactionInProgressButton'
import { useStakingContext } from '../StakingContext'
import { ReactNode } from 'react'

interface Props {
  leftContent?: ReactNode
}

export const StepActionButtons = ({ leftContent }: Props) => {
  const {
    buttonActions: { primary, secondary },
  } = useStakingContext()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="justify-start">{leftContent}</div>
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
