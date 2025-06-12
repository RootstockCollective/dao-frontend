import { Button } from '@/components/ButtonNew/Button'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { TransactionInProgressButton } from './TransactionInProgressButton'

interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface Props {
  primaryButton: ButtonProps
  secondaryButton: ButtonProps
  isTxPending?: boolean
  isRequesting?: boolean
  additionalContent?: ReactNode
}

export const StepActionButtons = ({
  primaryButton,
  secondaryButton,
  isTxPending = false,
  isRequesting = false,
  additionalContent,
}: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 mt-8',
        'md:flex-row md:items-center',
        additionalContent ? 'justify-between' : 'md:justify-end',
      )}
    >
      {additionalContent && <div className="hidden md:inline">{additionalContent}</div>}
      <div className="flex gap-4">
        <Button
          variant="secondary-outline"
          onClick={secondaryButton.onClick}
          data-testid={secondaryButton.label}
          disabled={secondaryButton.disabled || isRequesting || isTxPending}
        >
          {secondaryButton.label}
        </Button>
        {isTxPending ? (
          <TransactionInProgressButton />
        ) : (
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={primaryButton.onClick}
            data-testid={primaryButton.label}
            disabled={primaryButton.disabled || isRequesting}
          >
            {primaryButton.label}
          </Button>
        )}
      </div>
    </div>
  )
}
