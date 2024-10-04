import { Address } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Paragraph, Span } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import { BuilderProposal } from './hooks/useGetFilteredBuilders'
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
  proposalDescription,
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
    <>
      <div className="flex-1">
        <Span className="text-base font-semibold">{name}</Span>
        <Paragraph className="text-sm font-light"> Joined {joiningDate}</Paragraph>
      </div>
      {/* TODO: #22AD5C to be added in the theme */}
      <button onClick={() => router.push(`/proposals/${proposalId}`)}>
        <Badge status={status} bgColor={badgeBgColor} />
      </button>
    </>
  )
  const Body = (
    <>
      <Span className="text-base font-semibold">Proposal</Span>
      <Paragraph className="text-sm font-light py-1.5">{proposalDescription}</Paragraph>
      <Address address={address} />
    </>
  )
  return <Card header={Header} body={Body} />
}
