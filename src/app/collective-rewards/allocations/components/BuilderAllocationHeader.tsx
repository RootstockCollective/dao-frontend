import { AddressOrAlias } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Typography } from '@/components/Typography'
import { FC } from 'react'
import { Builder, BuilderProposal, BuilderStateFlags } from '@/app/collective-rewards/types'
import { getBuilderInactiveState, InactiveState, isBuilderActive } from '@/app/collective-rewards/utils'

export type BuilderAllocationHeaderProps = Pick<Builder, 'builderName' | 'address' | 'stateFlags' | 'gauge'> &
  Pick<BuilderProposal, 'date'>

const haltedClass = 'bg-[#932309] color-text-primary py-1 px-1 text-[12px]'

const haltedStateBadges: { [key in InactiveState]: JSX.Element } = {
  Paused: <Badge content="Paused" className="bg-[#F9E1FF] text-secondary py-1 px-1 text-[12px]" />,
  Deactivated: <Badge content="Deactivated" className={haltedClass} />,
  Revoked: <Badge content="Revoked" className={haltedClass} />,
}

export const BuilderAllocationHeader: FC<BuilderAllocationHeaderProps> = ({
  address,
  builderName,
  stateFlags,
}) => {
  const state = stateFlags as BuilderStateFlags

  return (
    <div className="flex flex-row w-full items-center content-between gap-3">
      <Jdenticon className="rounded-md bg-white" value={address} size="46" />
      <div className="flex flex-col items-start gap-2 max-w-48">
        <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap text-base leading-4">
          <AddressOrAlias addressOrAlias={builderName || address} className="text-base font-bold leading-4" />
        </Typography>
        {isBuilderActive(state) ? (
          <Badge content="Active" className="bg-[#DBFEE5] text-secondary py-1 px-1 text-[12px]" />
        ) : (
          haltedStateBadges[getBuilderInactiveState(state)]
        )}
      </div>
    </div>
  )
}
