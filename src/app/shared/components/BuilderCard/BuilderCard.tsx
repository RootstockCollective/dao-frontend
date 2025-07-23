import { ConnectPopover } from '@/app/backing/components/Popovers/ConnectPopover'
import { cn } from '@/lib/utils'
import { FC, useState } from 'react'
import { AllocationInput } from '@/app/backing/components/AllocationInput/AllocationInput'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { CurrentBacking } from '@/app/backing/components/CurrentBacking/CurrentBacking'
import { RewardsInfo } from '@/app/backing/components/RewardsInfo/RewardsInfo'
import { Button } from '@/components/ButtonNew'
import { WarningIcon } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { isBuilderRewardable } from '@/app/collective-rewards/utils/isBuilderOperational'
import { StylableComponentProps } from '@/components/commonProps'
import { BuilderCardControlProps } from './BuilderCardControl'

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
  onAllocationChange: (newAllocation: number) => void
  rifPriceUsd: number
  isConnected: boolean
  dataTestId?: string
  topBarColor?: string
  className?: string
  isInteractive?: boolean
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
}) => {
  const isRewardable = isBuilderRewardable(stateFlags)
  const [editing, setEditing] = useState(false)

  const builderPageLink = `/proposals/${proposal.id}`

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
      <BuilderHeader
        address={address}
        name={builderName}
        builderPageLink={builderPageLink}
        className="mt-8"
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
          {editing && <CurrentBacking existentAllocation={existentAllocation} />}
        </div>
      </div>
      <div>
        {isInteractive && (
          <Button
            variant="secondary-outline"
            onClick={() => onAllocationChange(0)}
            data-testid="removeBackingButton"
          >
            Remove backing
          </Button>
        )}
        {!isInteractive && (
          <ConnectPopover disabled={isConnected}>
            <Button variant="secondary-outline" data-testid="backBuilderButton">
              Back builder
            </Button>
          </ConnectPopover>
        )}
      </div>
    </div>
  )
}
