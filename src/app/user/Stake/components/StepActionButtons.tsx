import { Button } from '@/components/ButtonNew/Button'
import { ProgressButton } from '@/components/ProgressBarNew'
import { Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

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
  progressText?: string
  additionalContent?: ReactNode
}

export const StepActionButtons = ({
  primaryButton,
  secondaryButton,
  isTxPending = false,
  isRequesting = false,
  progressText = 'In progress',
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
          disabled={secondaryButton.disabled || isRequesting}
        >
          {secondaryButton.label}
        </Button>
        {isTxPending ? (
          <ProgressButton className="whitespace-nowrap">
            <Span bold className="text-text-60">
              {progressText}
            </Span>
            <Span className="text-text-80 hidden md:inline">&nbsp;- 1 min average</Span>
            <Span className="text-text-80 md:hidden">&nbsp;- 1 min avg</Span>
          </ProgressButton>
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
