import React, { ComponentProps } from 'react'
import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { Button } from '@/components/Button'
import { cn, truncate } from '@/lib/utils'
import { Address } from 'viem'
import { Label, Paragraph } from '@/components/Typography'

interface DelegateCardProps {
  address: Address
  since: string | number
  votingPower: string | number
  votingWeight: string | number
  totalVotes: string | number
  delegators: string | number
  onDelegate: (address: Address, rns?: string, imageIpfs?: string | null) => void
  name?: string
  imageIpfs?: string | null
  className?: string
  buttonText?: string
  buttonVariant?: ComponentProps<typeof Button>['variant']
  buttonDisabled?: boolean
}

export const DelegateCard: React.FC<DelegateCardProps> = ({
  address,
  name,
  imageIpfs,
  since,
  votingPower,
  votingWeight,
  totalVotes,
  delegators,
  onDelegate,
  className,
  buttonText = 'Delegate',
  buttonVariant = 'secondary-outline',
  buttonDisabled = false,
}) => {
  return (
    <div
      className={cn(
        'rounded bg-bg-60 px-4 pb-6 flex flex-col items-center relative',
        'w-full md:min-w-[220px]',
        className,
      )}
      data-testid={`delegateCardContainer-${address}`}
    >
      <BuilderHeader
        address={address}
        name={name}
        imageIpfs={imageIpfs}
        className="mt-8"
        showFullName={false}
        shouldNotRedirect
        headerProps={{ variant: 'h2', className: 'text-primary mt-2' }}
      />
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
      <Button
        variant={buttonVariant}
        className="mt-6 w-fit"
        onClick={() => onDelegate(address, name, imageIpfs)}
        disabled={buttonDisabled}
        data-testid={`${buttonText}Button`}
      >
        {buttonText}
      </Button>
    </div>
  )
}
