import { cn } from '@/lib/utils'
import { HTMLAttributes, PropsWithChildren } from 'react'
import type { ProposalType } from '../../types'
import { exampleCardData } from './data'
import { Header, Typography } from '@/components/Typography'

interface ProposalExampleProps extends HTMLAttributes<HTMLDivElement> {
  proposal: ProposalType
}

const Cell = ({ children }: PropsWithChildren) => (
  <div className="h-[31px] px-4 flex justify-between items-center flex-row border-[1px] border-[#2D2D2D] rounded-lg">
    {children}
  </div>
)

export function ExampleCard({ proposal, className, style, ...props }: ProposalExampleProps) {
  const { proposalId, proposer, Text, title, description } = exampleCardData[proposal]
  return (
    <div {...props} className={cn(className, 'flex flex-col items-center gap-3')}>
      <div className="p-4 w-[326px] min-h-[491px] flex flex-col border-[0.2px] gap-4 border-[rgba(255,255,255,0.3)] rounded-lg">
        <div className="flex-grow">
          <Header className="mb-4 text-base font-normal leading-tight text-center" fontFamily="kk-topo">
            {title}
          </Header>
          <div className="mb-3 flex flex-row justify-around nowrap text-[10px] font-[700] leading-tight">
            <Typography className="text-[rgba(255,255,255,0.6)]">Proposed by</Typography>
            <Typography className="text-primary">{proposer}</Typography>
            <Typography className="text-[rgba(255,255,255,0.6)]">Proposal ID</Typography>
            <Typography className="text-primary">ID {proposalId}</Typography>
          </div>
          <Text className="text-[10px] leading-[15px] space-y-4" />
        </div>
        <div className="flex flex-col gap-2">
          <Header className="text-base font-normal leading-tight " fontFamily="kk-topo">
            VOTES
          </Header>
          <Cell>
            <Typography className="text-[12px] text-[#1BC47D]">123K</Typography>
            <Typography className="text-[12px] text-[#1BC47D]">For</Typography>
          </Cell>
          <Cell>
            <Typography className="text-[12px] text-[#F24822]">12</Typography>
            <Typography className="text-[12px] text-[#F24822]">Against</Typography>
          </Cell>
          <Cell>
            <Typography className="text-[12px] text-[rgba(255,255,255,0.6)]">0</Typography>
            <Typography className="text-[12px] text-[rgba(255,255,255,0.6)]">Abstain</Typography>
          </Cell>
        </div>
      </div>
      <Typography className="text-[10px] leading-tight">{description}</Typography>
    </div>
  )
}
export default ExampleCard
