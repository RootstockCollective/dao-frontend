import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/ButtonNew/Button'
import { KotoQuestionMarkIcon } from '@/components/Icons'
import { InputNumber } from '@/components/Input/InputNumber'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Modal } from '@/components/Modal/Modal'
import { Tooltip } from '@/components/Tooltip'
import { Typography } from '@/components/TypographyNew/Typography'
import { cn, durationToLabel } from '@/lib/utils'
import { Duration } from 'luxon'

interface UpdateBackerRewardViewModalProps {
  onClose: () => void
  className?: string
  currentReward: number
  updatedReward: number
  onRewardChange: (updatedReward: string) => void
  onSave: (updatedReward: string) => void
  cooldownDuration?: Duration
  suggestedReward?: number
  isTxPending?: boolean
  isLoading?: boolean
  isOperational?: boolean
}

const UpdateBackerRewardViewModal = ({
  onClose,
  className,
  currentReward,
  updatedReward,
  onRewardChange,
  onSave,
  cooldownDuration,
  suggestedReward,
  isTxPending,
  isLoading,
  isOperational,
}: UpdateBackerRewardViewModalProps) => {
  const handleSave = () => {
    onSave(updatedReward.toString())
  }

  const timeRemaining = durationToLabel(cooldownDuration)

  return (
    <Modal
      onClose={onClose}
      width={700}
      height="auto"
      closeButtonColor="white"
      data-testid="UpdateBackerRewardViewModal"
      className={cn('font-rootstock-sans shadow-[0px_0px_40px_0px_rgba(255,255,255,0.10)]', className)}
    >
      <div className="relative flex flex-col gap-8 min-w-[500px] p-6">
        <Typography variant="h1">MY BACKERS&apos; REWARDS</Typography>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Typography variant="body">
              Any updates to the Rewards % will take effect after the {cooldownDuration?.days} days cooling
              period.
            </Typography>
            <div className="flex gap-6 justify-between">
              <div className="flex flex-col items-start gap-2">
                <Typography variant="body" className="text-bg-0">
                  Current Rewards %
                </Typography>
                <Typography variant="h1">{currentReward}%</Typography>
              </div>
              <div className="flex flex-col items-center gap-2 w-[60%]">
                <div className="flex flex-row items-center justify-between px-4 py-3 bg-input-bg w-full">
                  <div className="flex flex-col">
                    <Typography variant="body-xs" className="text-bg-0">
                      Updated Rewards %
                    </Typography>
                    <InputNumber
                      name="updatedReward"
                      value={updatedReward}
                      onValueChange={({ value }) => onRewardChange(value)}
                      className="w-20 border-none focus-visible:ring-0 outline-none"
                      decimalScale={0}
                      max={100}
                    />
                  </div>
                  {timeRemaining && (
                    <Typography variant="body" className="text-brand-rootstock-lime text-sm self-end">
                      Effective in {timeRemaining}
                    </Typography>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full justify-end">
                  {suggestedReward && (
                    <Button variant="secondary-outline" className="p-2 mr-4 text-sm font-normal gap-1">
                      {suggestedReward}%
                      <Tooltip
                        text="Average Rewards % of all the Collective Builders."
                        className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm')}
                        side="top"
                        align="center"
                      >
                        <KotoQuestionMarkIcon className="mt-[-0.3rem]" />
                      </Tooltip>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex gap-4 justify-end">
          <Button variant="secondary-outline" onClick={onClose}>
            Cancel
          </Button>
          {isTxPending ? (
            <TransactionInProgressButton />
          ) : (
            <Tooltip
              text="You need to be operational to adjust your backer reward %"
              className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm')}
              side="top"
              align="center"
              disabled={isOperational}
            >
              <Button onClick={handleSave}>Save changes</Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default UpdateBackerRewardViewModal
