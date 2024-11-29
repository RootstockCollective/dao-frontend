import { AddressOrAliasWithCopy } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Popover } from '@/components/Popover'
import { Paragraph, Span, Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { FC, HtmlHTMLAttributes, ReactNode } from 'react'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { shortAddress } from '@/lib/utils'
import { isAddress, Address } from 'viem'
import { Builder, BuilderState } from '@/app/collective-rewards/types'
import { isActive } from '@/app/collective-rewards/active-builders'

type ActiveBuildersGridItemProps = Builder

const Card = ({ header, body }: { header: ReactNode; body: ReactNode }) => {
  return (
    <div className="rounded-lg p-3.5 bg-input-bg">
      <div className="flex mb-5 items-center">{header}</div>
      <div className="flex flex-col rounded-lg">{body}</div>
    </div>
  )
}

const builderStatusMap = {
  active: 'Active',
  inProgress: 'In Progress',
}

const crStatusColorClasses: Record<BuilderState, HtmlHTMLAttributes<HTMLSpanElement>['className']> = {
  active: 'bg-[#DBFEE5] text-secondary',
  inProgress: 'bg-[#4B5CF0] color-text-primary',
} as const

// TODO: this content can be moved to a different component and become a generic card
export const ActiveBuildersGridItem: FC<ActiveBuildersGridItemProps> = ({
  address,
  builderName,
  stateFlags,
  proposal: { id: proposalId, date: joiningDate, name: proposalName },
}) => {
  const router = useRouter()
  const shortenAddress = shortAddress(address as Address)
  const builderState = isActive(stateFlags) ? 'active' : 'inProgress'
  const Header = (
    <div className="flex flex-row w-full items-center gap-x-3 min-h-11">
      <Jdenticon className="rounded-md bg-white" value={address} size="32" />
      <div className="flex-1 min-w-0">
        {/* TODO: To be reviewed, it's weird that we show the address in the tooltip
            and then we copy the builder name, since the builder name it's generally easier to remember
         */}
        <Popover
          content={
            <div className="text-[12px] font-bold mb-1">
              <p data-testid="builderAddressTooltip">{shortenAddress}</p>
            </div>
          }
          size="small"
          trigger="hover"
          disabled={!builderName || isAddress(builderName)}
        >
          <Typography tagVariant="label" className="font-semibold line-clamp-1 text-wrap min-h-6">
            <AddressOrAliasWithCopy
              addressOrAlias={builderName || address}
              clipboard={address}
              clipboardAnimationText={shortenAddress}
              className="text-base font-bold"
            />
          </Typography>
        </Popover>
        {builderState === 'active' && (
          <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
        )}
      </div>
      <div className="flex justify-center items-center">
        <Badge
          content={builderStatusMap[builderState]}
          className={`${crStatusColorClasses[builderState]} py-1 px-2`}
        />
      </div>
    </div>
  )
  const Body = (
    <div onClick={() => router.push(`/proposals/${proposalId}`)} className="cursor-pointer">
      <Span className="text-base font-semibold">Proposal</Span>
      <Span className="text-sm line-clamp-1 text-wrap">{proposalName}</Span>
    </div>
  )
  return <Card header={Header} body={Body} />
}
