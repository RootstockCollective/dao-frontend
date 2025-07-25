import { AllocationInput } from '@/app/backing/components/AllocationInput/AllocationInput'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { CurrentBacking } from '@/app/backing/components/CurrentBacking/CurrentBacking'
import { RewardsInfo } from '@/app/backing/components/RewardsInfo/RewardsInfo'
import { isBuilderRewardable } from '@/app/collective-rewards/utils/isBuilderOperational'
import { ConnectButton } from '@/app/components/Button/ConnectButton/ConnectButton'
import { Button } from '@/components/ButtonNew'
import { StylableComponentProps } from '@/components/commonProps'
import { WarningIcon } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { BuilderCardControlProps } from './BuilderCardControl'
import { WindshieldWiperAnimation } from './WindshieldWiperAnimation'

const Warning = ({ className }: StylableComponentProps<HTMLDivElement>) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <WarningIcon size={48} color="#DEFF1A" className="min-w-[48px] min-h-[48px]" />
      <Paragraph>Builder was deactivated by the foundation</Paragraph>
    </div>
  )
}

export interface BuilderCardProps extends BuilderCardControlProps {
  existentAllocation: bigint
  maxAllocation: bigint
  allocation: bigint
  onAllocationChange: (newAllocation: bigint) => void
  rifPriceUsd: number
  isConnected: boolean
  dataTestId?: string
  topBarColor?: string
  className?: string
  isInteractive?: boolean
  showAnimation?: boolean
  index?: number
}

export const BuilderCard: FC<BuilderCardProps> = ({
  address,
  builderName,
  proposal,
  stateFlags,
  existentAllocation,
  maxAllocation,
  allocation,
  backerRewardPct,
  rifPriceUsd,
  isConnected,
  estimatedRewards,
  allocationTxPending,
  onAllocationChange,
  topBarColor = 'transparent',
  dataTestId = '',
  className,
  isInteractive,
  showAnimation,
  index,
}) => {
  const isRewardable = isBuilderRewardable(stateFlags)
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  const builderPageLink = `/proposals/${proposal.id}`

  useEffect(() => setEditing(allocation !== existentAllocation), [allocation, existentAllocation])

  return (
    <WindshieldWiperAnimation
      backgroundColor="bg-v3-bg-accent-60"
      animatedBackgroundColor="bg-v3-bg-accent-100"
      showAnimation={showAnimation}
      index={index}
    >
      <div
        className={cn(
          'rounded px-2 pb-6 flex flex-col items-center relative min-w-[200px] h-full',
          className,
        )}
        data-testid={`builderCardContainer${dataTestId}`}
      >
        <div
          className="absolute top-0 left-0 w-full h-[8px] rounded-t"
          style={{ backgroundColor: topBarColor }}
          data-testid="builderCardTopBar"
        />
        <BuilderHeader
          address={address}
          name={builderName}
          builderPageLink={builderPageLink}
          className="mt-8"
          showFullName={false}
        />
        {!isRewardable && <Warning className="pt-3" />}
        <div className="my-6 w-full">
          <div
            className="w-full border border-v3-bg-accent-40 rounded-lg flex flex-col"
            data-testid="builderCardContent"
          >
            {isRewardable && (
              <RewardsInfo backerRewardPercentage={backerRewardPct} estimatedRewards={estimatedRewards} />
            )}

            {isInteractive && (
              <div className="p-3">
                <AllocationInput
                  allocation={allocation}
                  existentAllocation={existentAllocation}
                  maxAllocation={maxAllocation}
                  rifPriceUsd={rifPriceUsd}
                  allocationTxPending={allocationTxPending}
                  disabled={allocationTxPending || !isRewardable}
                  onAllocationChange={onAllocationChange}
                  editing={editing}
                  setEditing={setEditing}
                  className="px-2 py-3"
                />
              </div>
            )}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <CurrentBacking existentAllocation={existentAllocation} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          {isInteractive && (
            <Button
              variant="secondary-outline"
              onClick={() => onAllocationChange(0n)}
              data-testid="removeBackingButton"
            >
              Remove backing
            </Button>
          )}
          {!isInteractive && (
            <ConnectButton
              tooltipContent="Connect your wallet and get RIF before backing a Builder"
              data-testid="backBuilderButton"
              onClick={() => isConnected && router.push(`/backing?builders=${address}`)}
            >
              Back builder
            </ConnectButton>
          )}
        </div>
      </div>
    </WindshieldWiperAnimation>
  )
}
