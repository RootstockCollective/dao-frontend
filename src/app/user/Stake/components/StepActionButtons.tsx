import { Button } from '@/components/Button'
import { TransactionInProgressButton } from './TransactionInProgressButton'
import { ReactNode } from 'react'

interface ButtonAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  isTxPending?: boolean
}

interface ButtonActions {
  primary: ButtonAction
  secondary?: ButtonAction
}

interface Props {
  buttonActions: ButtonActions
  leftContent?: ReactNode
}

export const StepActionButtons = ({ buttonActions, leftContent }: Props) => {
  const { primary, secondary } = buttonActions

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
