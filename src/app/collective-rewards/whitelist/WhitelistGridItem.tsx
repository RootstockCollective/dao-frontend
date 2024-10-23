import { crStatusColorClasses } from '@/app/collective-rewards/BecomeABuilderButton'
import { BuilderProposal } from '@/app/collective-rewards/whitelist/hooks/useGetFilteredBuilders'
import { AddressOrAlias } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Popover } from '@/components/Popover'
import { Paragraph, Span, Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { Jdenticon } from '@/components/Header/Jdenticon'

type WhitelistGridItemProps = BuilderProposal

const Card = ({ header, body }: { header: ReactNode; body: ReactNode }) => {
  return (
    <div className="rounded-lg p-3.5 bg-input-bg">
      <div className="flex mb-5 items-center">{header}</div>
      <div className="flex flex-col rounded-lg">{body}</div>
    </div>
  )
}

// TODO: this content can be moved to a different component and become a generic card
export const WhitelistGridItem: FC<WhitelistGridItemProps> = ({
  displayName,
  address,
  status,
  joiningDate,
  proposalId,
  proposalName,
}) => {
  const router = useRouter()
  const Header = (
    <div className="flex flex-row w-full">
      <Jdenticon className="rounded-md bg-white mr-2" value={address} size="34" />
      <div className="flex-1 min-w-0">
        {/* TODO: To be reviewed, it's weird that we show the address in the tooltip
            and then we copy the builder name, since the builder name it's generally easier to remember
         */}
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="builderAddressTooltip">{address}</p>
            </div>
          }
          size="small"
          trigger="hover"
        >
          <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap">
            <AddressOrAlias addressOrAlias={displayName || address} />
          </Typography>
        </Popover>
        <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
      </div>
      <div className="flex justify-center items-center">
        <Badge content={status} className={`${crStatusColorClasses[status]} py-1 px-2`} />
      </div>
    </div>
  )
  const Body = (
    <div onClick={() => router.push(`/proposals/${proposalId}`)} className="cursor-pointer">
      <Span className="text-base font-semibold">Proposal</Span>
      <Span className="text-base line-clamp-1 text-wrap">{proposalName}</Span>
    </div>
  )
  return <Card header={Header} body={Body} />
}
