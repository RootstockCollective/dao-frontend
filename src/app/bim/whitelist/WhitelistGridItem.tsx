import { Address } from '@/components/Address'
import { Badge } from '@/components/Badge'
import { Paragraph, Span } from '@/components/Typography'
import { DateTime } from 'luxon'
import { FC, ReactNode } from 'react'
import { BuilderOffChainInfo } from '@/app/bim/types'

type WhitelistGridItemProps = BuilderOffChainInfo

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
  proposalDescription,
  address,
  joiningData,
}) => {
  const badgeBgColor = {
    Whitelisted: 'bg-[#22AD5C]',
    'In progress': 'bg-amber-500',
  }[status]
  const Header = (
    <>
      <div className="flex-1">
        <Span className="text-base font-semibold">{name}</Span>
        <Paragraph className="text-sm font-light">
          {' '}
          Joined {DateTime.fromISO(joiningData).toFormat('MMMM dd, yyyy')}
        </Paragraph>
      </div>
      {/* TODO: #22AD5C to be added in the theme */}
      <Badge status={status} bgColor={badgeBgColor} />
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
