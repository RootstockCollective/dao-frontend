import { cn } from '@/lib/utils'
import { cloneElement, HTMLAttributes, ReactElement } from 'react'
import type { ProposalType } from '../../types'
import { exampleCardData } from './data'
import { Header, Typography } from '@/components/Typography'

interface ProposalExampleProps extends HTMLAttributes<HTMLDivElement> {
  proposal: ProposalType
}

export function ExampleCard({ proposal, className, style, ...props }: ProposalExampleProps) {
  const { proposalId, proposer, text, title } = exampleCardData[proposal]
  return (
    <div
      {...props}
      className={cn(className, 'p-4 w-[326px] rounded-lg')}
      style={{ ...style, border: '0.2px solid rgba(255,255,255,0.3)' }}
    >
      <Header className="mb-4 text-base font-normal leading-tight text-center" fontFamily="kk-topo">
        {title}
      </Header>
      <div className="mb-3 flex flex-row justify-around nowrap text-[10px] font-[700] leading-tight">
        <Typography className="text-[rgba(255,255,255,0.6)]">Proposed by</Typography>
        <Typography className="text-primary">{proposer}</Typography>
        <Typography className="text-[rgba(255,255,255,0.6)]">Proposal ID</Typography>
        <Typography className="text-primary">ID {proposalId}</Typography>
      </div>
      {/* <div className="text-primary space-y-4">{example.text}</div> */}
      {cloneElement<HTMLAttributes<HTMLDivElement>>(text, {
        className: cn('text-[10px] leading-[15px] space-y-4'),
      })}
    </div>
  )
}
export default ExampleCard
