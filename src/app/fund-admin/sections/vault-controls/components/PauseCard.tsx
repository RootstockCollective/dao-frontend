'use client'

import { Button } from '@/components/Button'
import { ExclamationCircleIcon } from '@/components/Icons/ExclamationCircleIcon'
import { TransactionInProgressButton } from '@/components/StepActionButtons'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  isPaused: boolean
  onPause: (paused: boolean) => void
  isRequesting: boolean
  isTxPending: boolean
}

export function PauseCard({ title, description, isPaused, onPause, isRequesting, isTxPending }: Props) {
  const handleClick = () => onPause(!isPaused)
  const isBusy = isRequesting || isTxPending

  const actionLabel = isPaused ? 'Resume' : 'Pause'
  const buttonLabel = isRequesting ? 'Requesting...' : actionLabel

  return (
    <div className="flex flex-col flex-1 bg-bg-80 rounded-sm p-6 justify-between gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 justify-between">
          <Header variant="h3" caps>
            {title}
          </Header>
          <Span
            variant="body-xs"
            className={cn(
              'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-1',
              isPaused ? 'bg-error text-text-0' : 'bg-success text-text-0',
            )}
          >
            {isPaused ? 'Paused' : 'Active'}
          </Span>
        </div>
        <Paragraph variant="body-s" className="text-text-secondary mb-4">
          {description}
        </Paragraph>
        {isPaused && (
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon size={24} className="shrink-0 text-text-100" />
            <Paragraph variant="body-s">{`${title} has been paused.`}</Paragraph>
          </div>
        )}
      </div>
      <div className="flex justify-start">
        {isTxPending ? (
          <TransactionInProgressButton />
        ) : (
          <Button variant="secondary-outline" disabled={isBusy} onClick={handleClick}>
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
