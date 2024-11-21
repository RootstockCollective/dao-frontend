import { AddressOrAlias } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Paragraph, Typography } from '@/components/Typography'
import { FC } from 'react'
import { Builder, BuilderProposal, BuilderStateFlags } from '../types'

export type BuilderAllocationHeaderProps = Pick<Builder, 'address' | 'stateFlags' | 'gauge'> &
  Pick<BuilderProposal, 'name' | 'date'>

const isBuilderActive = ({ communityApproved, kycApproved, paused }: BuilderStateFlags) => {
  return communityApproved && kycApproved && !paused
}

export const BuilderAllocationHeader: FC<BuilderAllocationHeaderProps> = ({
  address,
  name,
  stateFlags,
  date,
  gauge,
}) => {
  const state = stateFlags as BuilderStateFlags

  return (
    <div className="flex flex-row w-full items-center content-between gap-3">
      <Jdenticon className="rounded-md bg-white" value={address} size="46" />
      <div className="flex flex-col items-start gap-2">
        <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap text-base leading-4">
          <AddressOrAlias addressOrAlias={name || address} className="text-base font-bold leading-4" />
        </Typography>
        {state.paused && (
          <Badge content="Paused" className="bg-[#F9E1FF] text-secondary py-1 px-1 text-[12px]" />
        )}
        {gauge && !state.communityApproved && (
          <Badge content="Deactivated" className="bg-[#932309] color-text-primary py-1 px-1 text-[12px]" />
        )}
        {isBuilderActive(state) && <Paragraph className="text-sm font-light"> Joined {date}</Paragraph>}
      </div>
    </div>
  )
}
