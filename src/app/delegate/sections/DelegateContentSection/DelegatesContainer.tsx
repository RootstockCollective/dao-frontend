import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Address, isAddress } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { Span } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { useState, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'
import { CloseIconKoto } from '@/components/Icons'

interface Props {
  didIDelegateToMyself: boolean
  onDelegate: (address: Address) => void
  onCloseClick?: () => void
}

export const DelegatesContainer = ({ didIDelegateToMyself, onDelegate, onCloseClick }: Props) => {
  const [addressToDelegate, setAddressToDelegate] = useState('')
  const isAddressInvalid = !!addressToDelegate && !isAddress(addressToDelegate)
  const isAddressValid = !!addressToDelegate && isAddress(addressToDelegate)

  const delegates = useNftHoldersWithVotingPower()

  const onDelegateChangeAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setAddressToDelegate(e.target.value)
  }

  const onUpdateDelegate = () => {
    if (isAddressValid) {
      onDelegate(addressToDelegate)
    }
  }

  return (
    <div className="bg-bg-80 mt-[8px] p-[24px]">
      <div className="mb-[10px] flex flex-col items-center">
        {!didIDelegateToMyself && (
          <CloseIconKoto className="self-end cursor-pointer" onClick={onCloseClick} />
        )}
        <Span>
          {didIDelegateToMyself
            ? 'Input delegate to make governance decisions on your behalf'
            : 'Input a new delegate for your voting power'}
        </Span>
        {/* @TODO support RNS */}
        <input
          type="text"
          name="address"
          placeholder="Delegate's RNS name or address"
          className={cn(
            'w-full max-w-md bg-bg-60 placeholder:text-[16px] font-rootstock-sans px-[16px] py-[16px] mt-4 rounded text-white placeholder-bg-0',
            isAddressInvalid && 'border border-red-500',
          )}
          onChange={onDelegateChangeAddress}
        />
        <div>
          <Button
            variant="primary"
            className="mt-3 mb-[40px]"
            onClick={onUpdateDelegate}
            disabled={isAddressInvalid}
          >
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
            name={delegate.RNS || undefined}
            // @TODO fetch since
            since="May 2025"
            votingPower={delegate.votingPower?.toString() || 0}
            // @TODO fetch voting weight
            votingWeight=" - "
            // @TODO fetch total votes
            totalVotes={' - '}
            // @TODO fetch delegators
            delegators={' - '}
            onDelegate={() => onDelegate(delegate.address as Address)}
          />
        ))}
      </div>
    </div>
  )
}
