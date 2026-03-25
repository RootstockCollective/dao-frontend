'use client'

import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button'
import { TextArea } from '@/components/FormFields/TextArea'
import { ExclamationCircleIcon } from '@/components/Icons/ExclamationCircleIcon'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  isPaused: boolean
  onPause: (paused: boolean) => void
  isSubmitting: boolean
  pausedReason?: string // TODO: add this to the contract
}

export function PauseCard({ title, description, isPaused, onPause, isSubmitting, pausedReason }: Props) {
  const { control } = useForm({ defaultValues: { reason: '' } })

  const handleClick = () => onPause(!isPaused)

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
        {!isPaused ? (
          <TextArea control={control} name="reason" label="Short description" minRows={3} maxRows={12} />
        ) : (
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon size={24} className="shrink-0 text-text-100" />
            <Paragraph variant="body-s">
              {`${title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()} has been paused${pausedReason ? ` because of: ${pausedReason}` : ''}.`}
            </Paragraph>
          </div>
        )}
      </div>
      <div className="flex justify-start">
        <Button variant="secondary-outline" disabled={isSubmitting} onClick={handleClick}>
          {isSubmitting ? 'Submitting...' : isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>
    </div>
  )
}
