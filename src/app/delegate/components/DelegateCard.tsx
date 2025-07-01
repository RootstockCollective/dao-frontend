import React from 'react'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { Button } from '@/components/ButtonNew'
import { cn } from '@/lib/utils'
import { Address } from 'viem'
import { Label, Paragraph } from '@/components/TypographyNew'

export interface DelegateCardProps {
  address: Address
  name?: string
  since: string | number
  votingPower: string | number
  votingWeight: string
  totalVotes: string | number
  delegators: string | number
  onDelegate: () => void
  className?: string
}

export const DelegateCard: React.FC<DelegateCardProps> = ({
  address,
  name,
  since,
  votingPower,
  votingWeight,
  totalVotes,
  delegators,
  onDelegate,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded bg-bg-60 px-2 pb-6 flex flex-col items-center relative min-w-[200px]',
        className,
      )}
      data-testid="delegateCardContainer"
    >
      <BuilderHeader address={address} name={name} className="mt-8" />
      <Paragraph className="text-text-80" variant="body-xs">
        delegate since {since}
      </Paragraph>
      <div className="w-full bg-background-60 rounded-lg p-3 mt-6 border border-bg-40">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          <div>
            <Label className="text-bg-0" variant="body-xs">
              Voting power
            </Label>
            <Paragraph>{votingPower}</Paragraph>
          </div>
          <div>
            <Label className="text-bg-0" variant="body-xs">
              Voting weight
            </Label>
            <Paragraph>{votingWeight}</Paragraph>
          </div>
          <div>
            <Label className="text-bg-0" variant="body-xs">
              Total votes
            </Label>
            <Paragraph>{totalVotes}</Paragraph>
          </div>
          <div>
            <Label className="text-bg-0" variant="body-xs">
              Delegators
            </Label>
            <Paragraph>{delegators}</Paragraph>
          </div>
        </div>
      </div>
      <Button variant="secondary-outline" className="mt-6" onClick={onDelegate}>
        Delegate
      </Button>
    </div>
  )
}
