import { Address } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Paragraph, Span, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import { BuilderProposal } from '@/app/bim/whitelist/hooks/useGetFilteredBuilders'
import { useRouter } from 'next/navigation'

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
  //TODO: pending to check the colors
  const badgeBgColor = {
    Whitelisted: 'bg-[#22AD5C]',
    'In progress': 'bg-[#F59E0B]',
    'KYC Approved': 'bg-[#637381]',
    'KYC Under Review': 'bg-[#808080]',
  }[status]

  const router = useRouter()
  const Header = (
    <div className="flex flex-row w-full">
      <div className="flex-1 w-3/5">
        <Typography tagVariant="label" className="font-semibold">
          <Address address={address} />
        </Typography>
        <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
      </div>
      <div className="w-2/5 text-end">
        {/* TODO: #22AD5C to be added in the theme */}
        <Badge status={status} bgColor={badgeBgColor} />
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
