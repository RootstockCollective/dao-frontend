import { ConnectPopover } from '@/app/backing/components/builder-card/ConnectPopover/ConnectPopover'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { AllocationInput } from '../AllocationInput/AllocationInput'
import { BuilderHeader } from '../BuilderHeader/BuilderHeader'
import { CurrentBacking } from '../CurrentBacking/CurrentBacking'
import { RewardsInfo } from '../RewardsInfo/RewardsInfo'

interface BuilderCardProps {
  builderAddress: string
  builderName: string
  currentAllocation: number
  maxAllocation: number
  allocation: number
  onAllocationChange: (newAllocation: number) => void
  builderRewardPct: number
  topBarColor: string
  rifPriceUsd: number
  isConnected: boolean
  builderNextRewardPct?: number
  estimatedRewards?: string
  allocationTxPending?: boolean
  dataTestId?: string
  className?: string
  onBuilderNameClick: () => void
}

export const BuilderCard: FC<BuilderCardProps> = ({
  builderAddress,
  builderName,
  currentAllocation,
  maxAllocation,
  allocation,
  builderRewardPct,
  rifPriceUsd,
  isConnected,
  builderNextRewardPct,
  estimatedRewards,
  allocationTxPending,
  onAllocationChange,
  topBarColor,
  dataTestId = '',
  className,
  onBuilderNameClick,
}) => {
  return (
    <div
      className={cn(
        'rounded bg-[#37322F] px-2 pb-6 flex flex-col items-center relative w-1/4 min-w-[280px]',
        className,
      )}
      data-dataTestId={`builderCardContainer${dataTestId}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[8px] rounded-t"
        style={{ backgroundColor: topBarColor }}
        data-dataTestId="builderCardTopBar"
      />
      <BuilderHeader
        address={builderAddress}
        name={builderName}
        onNameClick={onBuilderNameClick}
        className="mt-8"
      />
      <div
        className="w-full mt-6 border border-[#66605C] rounded-lg gap-3 flex flex-col divide-y divide-[#66605C]"
        data-dataTestId="builderCardContent"
      >
        <RewardsInfo
          builderRewardPct={builderRewardPct}
          builderNextRewardPct={builderNextRewardPct}
          estimatedRewards={estimatedRewards}
        />
        {isConnected && (
          <AllocationInput
            allocation={allocation}
            maxAllocation={maxAllocation}
            currentAllocation={currentAllocation}
            allocationTxPending={allocationTxPending}
            rifPriceUsd={rifPriceUsd}
            onAllocationChange={onAllocationChange}
            className="px-2 py-3 mx-3"
          />
        )}
        {isConnected && <CurrentBacking currentAllocation={currentAllocation} />}
      </div>
      {isConnected && currentAllocation !== 0 && (
        <Button
          variant="secondary"
          className={cn('border-[#66605C] px-2 py-1 mt-6')}
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
            className={cn('border-[#66605C] px-2 py-1 mt-6')}
            textClassName="text-[14px] font-normal"
            onClick={() => onAllocationChange(allocation)}
            data-testid="backBuilderButton"
          >
            Back builder
          </Button>
        </ConnectPopover>
      )}
    </div>
  )
}
