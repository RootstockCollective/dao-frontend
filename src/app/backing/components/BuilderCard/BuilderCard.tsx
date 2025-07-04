import { ConnectPopover } from '@/app/backing/components/Popovers/ConnectPopover'
import { BackerRewardPercentage, TokenRewards } from '@/app/collective-rewards/rewards/types'
import { Builder } from '@/app/collective-rewards/types'
import { cn } from '@/lib/utils'
import { FC, useState } from 'react'
import { AllocationInput } from '../AllocationInput/AllocationInput'
import { BuilderHeader } from '../BuilderHeader/BuilderHeader'
import { CurrentBacking } from '../CurrentBacking/CurrentBacking'
import { RewardsInfo } from '../RewardsInfo/RewardsInfo'
import { Button } from '@/components/ButtonNew'
import { WarningIcon } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { isBuilderRewardable } from '@/app/collective-rewards/utils/isBuilderOperational'

const Warning = () => {
  return (
    <div className="flex items-center gap-2">
      <WarningIcon size={48} color="#DEFF1A" className="min-w-[48px] min-h-[48px]" />
      <Paragraph>Builder was deactivated by the foundation</Paragraph>
    </div>
  )
}

export interface BuilderCardProps extends Builder {
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
  stateFlags,
  existentAllocation,
  maxAllocation,
  allocation,
  backerRewardPercentage,
  rifPriceUsd,
  isConnected,
  estimatedRewards,
  allocationTxPending,
  onAllocationChange,
  topBarColor = 'transparent',
  dataTestId = '',
  className,
}) => {
  const isRewardable = isBuilderRewardable(stateFlags)
  const [editing, setEditing] = useState(false)

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
      {!isRewardable && (
        <div className="pt-5">
          <Warning />
        </div>
      )}
      <div className="my-6 w-full">
        <div
          className="w-full border border-v3-bg-accent-40 rounded-lg flex flex-col"
          data-testid="builderCardContent"
        >
          {isRewardable && (
            <RewardsInfo
              backerRewardPercentage={backerRewardPercentage}
              estimatedRewards={estimatedRewards}
            />
          )}

          {isConnected && (
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
          {isConnected && editing && <CurrentBacking existentAllocation={existentAllocation} />}
        </div>
      </div>
      <div>
        {isConnected && existentAllocation !== 0n && (
          <Button
            variant="secondary-outline"
            onClick={() => onAllocationChange(0)}
            data-testid="removeBackingButton"
          >
            Remove backing
          </Button>
        )}
        {!isConnected && (
          <ConnectPopover>
            <Button variant="secondary-outline" data-testid="backBuilderButton">
              Back builder
            </Button>
          </ConnectPopover>
        )}
      </div>
    </div>
  )
}
