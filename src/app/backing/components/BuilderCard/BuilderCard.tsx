import { ConnectPopover } from '@/app/backing/components/Popovers/ConnectPopover'
import { BackerRewardPercentage, TokenRewards } from '@/app/collective-rewards/rewards/types'
import { Builder } from '@/app/collective-rewards/types'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { AllocationInput } from '../AllocationInput/AllocationInput'
import { BuilderHeader } from '../BuilderHeader/BuilderHeader'
import { CurrentBacking } from '../CurrentBacking/CurrentBacking'
import { RewardsInfo } from '../RewardsInfo/RewardsInfo'

export interface BuilderCardProps extends Builder {
  backerRewardPct: BackerRewardPercentage
  existentAllocation: bigint
  maxAllocation: bigint
  allocation: bigint
  onAllocationChange: (newAllocation: number) => void
  rifPriceUsd: number
  isConnected: boolean
  estimatedRewards?: TokenRewards
  allocationTxPending?: boolean
  dataTestId?: string
  topBarColor?: string
  className?: string
}

export const BuilderCard: FC<BuilderCardProps> = ({
  address,
  builderName,
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
}) => {
  return (
    <div
      className={cn(
        'rounded bg-v3-bg-accent-60 px-2 pb-6 flex flex-col items-center relative min-w-[200px]',
        className,
      )}
      data-testid={`builderCardContainer${dataTestId}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[8px] rounded-t"
        style={{ backgroundColor: topBarColor }}
        data-testid="builderCardTopBar"
      />
      {/* FIXME: replace the builder page link */}
      <BuilderHeader address={address} name={builderName} builderPageLink="#" className="mt-8" />
      <div
        className="w-full mt-6 border border-v3-bg-accent-40 rounded-lg gap-3 flex flex-col divide-y divide-v3-bg-accent-40"
        data-testid="builderCardContent"
      >
        <RewardsInfo {...backerRewardPct} estimatedRewards={estimatedRewards} />
        {isConnected && (
          <AllocationInput
            allocation={allocation}
            existentAllocation={existentAllocation}
            maxAllocation={maxAllocation}
            rifPriceUsd={rifPriceUsd}
            allocationTxPending={allocationTxPending}
            onAllocationChange={onAllocationChange}
            className="px-2 py-3 mx-3"
          />
        )}
        {isConnected && <CurrentBacking existentAllocation={existentAllocation} />}
      </div>
      {isConnected && existentAllocation !== 0n && (
        <Button
          variant="secondary"
          className="border-v3-bg-accent-40 px-2 py-1 mt-6"
          textClassName="text-[14px] font-normal"
          onClick={() => onAllocationChange(0)}
          data-testid="removeBackingButton"
        >
          Remove backing
        </Button>
      )}
      {!isConnected && (
        <ConnectPopover>
          <Button
            variant="secondary"
            className={cn('border-v3-bg-accent-40 px-2 py-1 mt-6')}
            textClassName="text-[14px] font-normal"
            data-testid="backBuilderButton"
          >
            Back builder
          </Button>
        </ConnectPopover>
      )}
    </div>
  )
}
