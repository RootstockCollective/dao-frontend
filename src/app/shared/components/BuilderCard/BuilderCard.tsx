import { AllocationInput } from '@/app/backing/components/AllocationInput/AllocationInput'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { RewardsInfo } from '@/app/backing/components/RewardsInfo/RewardsInfo'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import {
  BuilderInactiveState,
  builderInactiveStateMessage,
  getBuilderInactiveState,
  isBuilderRewardable,
} from '@/app/collective-rewards/utils/isBuilderOperational'
import { ConnectButton } from '@/app/components/Button/ConnectButton/ConnectButton'
import { Button } from '@/components/ButtonNew'
import { CommonComponentProps, StylableComponentProps } from '@/components/commonProps'
import { WarningIcon } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { useAccount } from 'wagmi'
import { getBuilderColor } from '../utils'
import { BuilderCardControlProps } from './BuilderCardControl'
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

export interface BuilderCardProps extends BuilderCardControlProps {
  dataTestId?: string
  isInteractive?: boolean
  showAnimation?: boolean
  index?: number
}

export const BuilderCard = ({
  address,
  builderName,
  gauge,
  proposal,
  stateFlags,
  backerRewardPct,
  estimatedRewards,
  allocationTxPending,
  dataTestId = '',
  className,
  isInteractive,
  showAnimation,
  index,
}: BuilderCardProps & CommonComponentProps): React.ReactElement => {
  const router = useRouter()
  const {
    actions: { updateAllocation },
    state: { allocations },
  } = useContext(AllocationsContext)
  const { isConnected } = useAccount()

  const allocation = allocations[address] ?? 0n
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
          'rounded px-2 pb-6 flex flex-col items-center relative min-w-[200px] h-full',
          className,
        )}
        data-testid={`builderCardContainer${dataTestId}`}
      >
        <div
          className="absolute top-0 left-0 w-full h-[8px] rounded-t"
          style={{
            backgroundColor: allocation > 0n && isConnected ? getBuilderColor(address) : 'transparent',
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
                  builderAddress={address}
                  allocationTxPending={allocationTxPending}
                  disabled={allocationTxPending || !isRewardable}
                  className="px-2 py-3"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          {isInteractive && (
            <Button
              variant="secondary-outline"
              onClick={() => updateAllocation(address, 0n)}
              data-testid="removeBackingButton"
            >
              Remove backing
            </Button>
          )}
          {!isInteractive && (
            <ConnectButton
              tooltipContent="Connect your wallet and get RIF before backing a Builder"
              data-testid="backBuilderButton"
              onClick={() => {
                isConnected && router.push(`/backing?builders=${address}`)
              }}
            >
              Back builder
            </ConnectButton>
          )}
        </div>
      </div>
    </WindshieldWiperAnimation>
  )
}
