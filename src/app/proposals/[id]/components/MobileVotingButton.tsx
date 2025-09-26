import { Button } from '@/components/Button'
import { Span } from '@/components/Typography'

interface MobileVotingButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

export const MobileVotingButton = ({
  onClick,
  disabled = false,
  'data-testid': dataTestId,
}: MobileVotingButtonProps) => {
  return (
    <div className="w-full bg-bg-60 p-4 text-center bottom-0 fixed inset-x-0">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="secondary-outline"
        data-testid={dataTestId}
        className="py-3"
      >
        <Span variant="body" className="text-white">
          See vote details/Take action on proposal
        </Span>
      </Button>

      <Span variant="body-s" className="text-white !mt-4">
        Use your power to make a difference
      </Span>
    </div>
  )
}
