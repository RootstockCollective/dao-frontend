import { bimStatusColorClasses } from '@/app/bim/BecomeABuilderButton'
import { BuilderProposal } from '@/app/bim/whitelist/hooks/useGetFilteredBuilders'
import { Address } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Paragraph, Span, Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { FC, ReactNode } from 'react'

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
  name,
  status,
  address,
  joiningDate,
  proposalId,
}) => {
  const router = useRouter()
  const Header = (
    <div className="flex flex-row w-full">
      <div className="flex-1">
        <Typography tagVariant="label" className="font-semibold">
          <Address address={address} />
        </Typography>
        <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
      </div>
      <div className="flex justify-center items-center">
        <Badge content={status} className={`${bimStatusColorClasses[status]} py-1 px-2`} />
      </div>
    </div>
  )
  const Body = (
    <div onClick={() => router.push(`/proposals/${proposalId}`)} className="cursor-pointer">
      <Span className="text-base font-semibold">Proposal</Span>
      <Span className="text-base line-clamp-1 text-wrap">{name}</Span>
    </div>
  )
  return <Card header={Header} body={Body} />
}
