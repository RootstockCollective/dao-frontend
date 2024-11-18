import { Builder, BuilderStatusActive, BuilderStatusShown } from '@/app/collective-rewards/types'
import { crStatusColorClasses } from '@/app/collective-rewards/user'
import { AddressOrAlias } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Paragraph, Typography } from '@/components/Typography'
import { FC } from 'react'

export type BuilderAllocationHeaderProps = Pick<Builder, 'address' | 'builderName' | 'status' | 'joiningDate'>

export const BuilderAllocationHeader: FC<BuilderAllocationHeaderProps> = ({
  address,
  builderName,
  status,
  joiningDate,
}) => {
  return (
    <div className="flex flex-row w-full items-center content-between gap-3">
      <Jdenticon className="rounded-md bg-white" value={address} size="46" />
      <div className="flex flex-col items-start gap-2">
        <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap text-base leading-4">
          <AddressOrAlias addressOrAlias={builderName || address} className="text-base font-bold leading-4" />
        </Typography>
        {status !== BuilderStatusActive && (
          <Badge
            content={status}
            className={`${crStatusColorClasses[status as BuilderStatusShown]} py-1 px-1 text-[12px]`}
          />
        )}
        {status === BuilderStatusActive && (
          <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
        )}
      </div>
    </div>
  )
}
