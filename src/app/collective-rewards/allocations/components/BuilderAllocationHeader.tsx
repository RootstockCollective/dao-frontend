import { AddressOrAlias } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Typography } from '@/components/Typography'
import { FC } from 'react'
import { Builder, BuilderProposal, BuilderStateFlags } from '@/app/collective-rewards/types'
import { getBuilderInactiveState, InactiveState, isBuilderActive } from '@/app/collective-rewards/utils'

export type BuilderAllocationHeaderProps = Pick<Builder, 'builderName' | 'address' | 'stateFlags' | 'gauge'> &
  Pick<BuilderProposal, 'date'>

const badgeBaseClass = 'py-1 px-1 text-[12px]'
const haltedClass = `${badgeBaseClass} bg-[#932309] color-text-primary`
const badgeState: {
  [key in InactiveState | 'Active']: { content: string; className: string }
} = {
  Active: { content: 'Active', className: `${badgeBaseClass} bg-[#DBFEE5] text-secondary` },
  KYCPaused: { content: 'KYCPaused', className: `${badgeBaseClass} bg-[#F9E1FF] text-secondary` },
  Deactivated: { content: 'Deactivated', className: `${badgeBaseClass} ${haltedClass}` },
  SelfPaused: { content: 'SelfPaused', className: `${badgeBaseClass} ${haltedClass}` },
}

export const BuilderAllocationHeader: FC<BuilderAllocationHeaderProps> = ({
  address,
  builderName,
  stateFlags,
}) => {
  const state = stateFlags as BuilderStateFlags
  const stateKey = isBuilderActive(state) ? 'Active' : getBuilderInactiveState(state)
  const { content, className } = badgeState[stateKey]

  return (
    <div className="flex flex-row w-full items-center content-between gap-3">
      <Jdenticon className="rounded-md bg-white" value={address} size="46" />
      <div className="flex flex-col items-start gap-2 max-w-48">
        <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap text-base leading-4">
          <AddressOrAlias addressOrAlias={builderName || address} className="text-base font-bold leading-4" />
        </Typography>
        <Badge content={content} className={className} />
      </div>
    </div>
  )
}
