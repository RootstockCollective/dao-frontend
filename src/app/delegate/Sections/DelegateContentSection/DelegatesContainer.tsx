'use client'
import { DelegateCard } from '@/app/delegate/components'
import { Address } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { Span } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { useState, ChangeEvent } from 'react'

interface Props {
  didIDelegateToMyself: boolean
}

export const DelegatesContainer = ({ didIDelegateToMyself }: Props) => {
  const [addressToDelegate, setAddressToDelegate] = useState('')

  const delegates = useNftHoldersWithVotingPower()
  // @TODO execution action from context (delegate)

  const onDelegateChangeAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setAddressToDelegate(e.target.value)
  }

  const onUpdateDelegate = () => {
    // @TODO trigger modal here
  }
  return (
    <div className="bg-bg-80 mt-[8px] p-[24px]">
      <div className="mb-[10px] flex flex-col items-center">
        <Span>
          {didIDelegateToMyself
            ? 'Input delegate to make governance decisions on your behalf'
            : 'Input a new delegate for your voting power'}
        </Span>
        <input
          type="text"
          name="address"
          placeholder="Delegate's RNS name or address"
          className="w-full max-w-md bg-bg-60 placeholder:text-[16px] font-rootstock-sans px-[16px] py-[16px] mt-4 rounded text-white placeholder-bg-0"
          onChange={onDelegateChangeAddress}
        />
        <div>
          <Button variant="primary" className="mt-3 mb-[40px]" onClick={onUpdateDelegate}>
            {didIDelegateToMyself ? 'Delegate' : 'Update delegate'}
          </Button>
        </div>
        <Span>or select one of the delegates vetted by the community</Span>
      </div>
      <div className="flex flex-row flex-wrap gap-[8px] justify-center mt-6">
        {delegates.map(delegate => (
          <DelegateCard
            key={delegate.address}
            address={delegate.address as Address}
            since="May 2025"
            votingPower={delegate.votingPower?.toString() || 0}
            votingWeight=" - "
            totalVotes={1}
            delegators={89}
            onDelegate={() =>
              console.log('Here we should trigger modal to delegate' /* @TODO add this action */)
            }
          />
        ))}
      </div>
    </div>
  )
}
