import { AlwaysEnabledButton } from '@/app/components'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { KotoQuestionMarkIcon } from '@/components/Icons'
import { InputNumber } from '@/components/Input/InputNumber'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Modal } from '@/components/Modal/Modal'
import { Tooltip } from '@/components/Tooltip'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn, durationToLabel } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { Duration } from 'luxon'

interface UpdateBackerRewardViewModalProps {
  onClose: () => void
  className?: string
  currentReward: number
  updatedReward: number
  alreadySubmitted?: boolean
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
  alreadySubmitted,
  onRewardChange,
  onSave,
  cooldownDuration,
  suggestedReward,
  isTxPending,
  isLoading,
  isOperational,
}: UpdateBackerRewardViewModalProps) => {
  const isDesktop = useIsDesktop()

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
      fullscreen={!isDesktop}
    >
      <div className={cn('relative flex flex-col gap-8', isDesktop ? 'p-6' : 'p-4 mt-12')}>
        <Header variant="h1">MY BACKERS&apos; REWARDS</Header>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Paragraph variant="body">
              Any updates to the Rewards % will take effect after the {cooldownDuration?.days} days cooling
              period.
            </Paragraph>
            <div className="flex flex-col md:flex-row gap-6 md:justify-between">
              <div className="flex flex-col items-start gap-2">
                <Span variant="body" className="text-bg-0">
                  Current Rewards %
                </Span>
                <Header variant="h1">{currentReward}%</Header>
              </div>
              <div className="flex flex-col items-center gap-2 w-full md:w-[60%]">
                <div className="flex flex-row items-end justify-between px-4 py-3 bg-bg-60 w-full gap-2">
                  <div className="flex flex-col">
                    <Span variant="body-xs" className="text-bg-0">
                      Updated Rewards %
                    </Span>
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
                    <Paragraph variant="body-s" className="text-brand-rootstock-lime md:self-end">
                      Effective in {timeRemaining}
                    </Paragraph>
                  )}
                </div>
                {suggestedReward && (
                  <div className="flex items-center gap-3 md:gap-2 w-full px-4 py-0 justify-end self-end">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary-outline" className="px-2 py-1.5 md:py-1 gap-1">
                        <Span variant="body-s">{suggestedReward}%</Span>
                      </Button>
                    </div>
                    <Tooltip
                      text="Average Rewards % of all the Collective Builders."
                      className={cn('rounded-sm bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm')}
                      side="top"
                      align="center"
                    >
                      <KotoQuestionMarkIcon />
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <div
          className={cn(
            'flex gap-4 md:justify-end',
            isDesktop ? '' : 'fixed bottom-0 left-0 right-0 p-4 bg-bg-80',
          )}
        >
          <Button variant="secondary-outline" onClick={onClose} className="w-full md:w-auto">
            Cancel
          </Button>
          {isTxPending ? (
            <TransactionInProgressButton />
          ) : (
            <AlwaysEnabledButton
              onClick={handleSave}
              className="w-full md:w-auto"
              conditionPairs={[
                {
                  condition: () => !isOperational,
                  lazyContent: () => 'You need to be operational to adjust your backer reward %',
                },
                {
                  condition: () => !!alreadySubmitted,
                  lazyContent: () => "You can't submit the same backer reward %",
                },
              ]}
            >
              Save changes
            </AlwaysEnabledButton>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default UpdateBackerRewardViewModal
