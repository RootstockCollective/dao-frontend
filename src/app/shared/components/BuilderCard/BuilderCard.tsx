import {
  AllocationInput,
  AllocationInputProps,
} from '@/app/backing/components/AllocationInput/AllocationInput'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { CurrentBacking } from '@/app/backing/components/CurrentBacking/CurrentBacking'
import { RewardsInfo } from '@/app/backing/components/RewardsInfo/RewardsInfo'
import { TokenRewards } from '@/app/collective-rewards/rewards'
import { Builder } from '@/app/collective-rewards/types'
import {
  BuilderInactiveState,
  builderInactiveStateMessage,
  getBuilderInactiveState,
  isBuilderRewardable,
} from '@/app/collective-rewards/utils/isBuilderOperational'
import { ConnectButton } from '@/app/components/Button/ConnectButton/ConnectButton'
import { Button } from '@/components/Button'
import { CommonComponentProps, StylableComponentProps } from '@/components/commonProps'
import { WarningIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { getBuilderColor } from '../utils'
import { WindshieldWiperAnimation } from './WindshieldWiperAnimation'

const Warning = ({
  className,
  builderInactiveState,
}: StylableComponentProps<HTMLDivElement> & {
  builderInactiveState: BuilderInactiveState
}): React.ReactElement => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <WarningIcon size={48} color="#DEFF1A" className="min-w-[48px] min-h-[48px]" />
      <Paragraph>{builderInactiveStateMessage[builderInactiveState]}</Paragraph>
    </div>
  )
}

export interface BuilderCardProps {
  dataTestId?: string
  isInteractive?: boolean
  showAnimation?: boolean
  index?: number
  builder: Builder
  allocationInputProps: Omit<AllocationInputProps, 'onEdit'>
  estimatedRewards?: TokenRewards
  hasPendingTx?: boolean
  onConnect?: () => void
}

export const BuilderCard = ({
  builder: { address, builderName, gauge, proposal, stateFlags, backerRewardPct },
  allocationInputProps,
  estimatedRewards,
  dataTestId = '',
  className,
  isInteractive,
  showAnimation,
  index,
  onConnect,
}: BuilderCardProps & CommonComponentProps): React.ReactElement => {
  const [editing, setEditing] = useState(false)
  const builderInactiveState = getBuilderInactiveState({ address, builderName, proposal, stateFlags, gauge })
  const isRewardable = isBuilderRewardable(stateFlags)
  const builderPageLink = `/proposals/${proposal.id}`

  return (
    <WindshieldWiperAnimation
      backgroundColor="bg-v3-bg-accent-60"
      animatedBackgroundColor="bg-v3-bg-accent-100"
      showAnimation={showAnimation}
      index={index}
    >
      <div
        className={cn(
          'px-2 pb-6 flex flex-col items-center relative min-w-[268px] max-lg:w-[268px] h-full',
          className,
        )}
        data-testid={`builderCardContainer${dataTestId}`}
      >
        <div
          className="absolute top-0 left-0 w-full h-[8px] rounded-t"
          style={{
            backgroundColor:
              allocationInputProps.updatedBackingState.builderBacking > 0n && !!address
                ? getBuilderColor(address)
                : 'transparent',
          }}
          data-testid="builderCardTopBar"
        />
        <BuilderHeader
          address={address}
          name={builderName}
          builderPageLink={builderPageLink}
          className="mt-8"
          showFullName={false}
        />
        {!isRewardable && builderInactiveState && (
          <Warning className="pt-3" builderInactiveState={builderInactiveState} />
        )}
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
                  className="px-2 py-3"
                  {...allocationInputProps}
                  onEdit={setEditing}
                  disabled={allocationInputProps.disabled || !isRewardable}
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
                  <CurrentBacking
                    existentAllocation={allocationInputProps.onchainBackingState.builderBacking}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          {isInteractive && (
            <Button
              variant="secondary-outline"
              onClick={() => allocationInputProps.updateBacking(0n)}
              data-testid="removeBackingButton"
            >
              Remove backing
            </Button>
          )}
          {!isInteractive && (
            <ConnectButton
              tooltipContent="Connect your wallet and get RIF before backing a Builder"
              data-testid="backBuilderButton"
              onClick={onConnect}
            >
              Back builder
            </ConnectButton>
          )}
        </div>
      </div>
    </WindshieldWiperAnimation>
  )
}
