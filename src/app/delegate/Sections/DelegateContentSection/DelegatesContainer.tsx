import { DelegateCard } from '@/app/delegate/components'
import { Address } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { Span } from '@/components/TypographyNew'

export const DelegatesContainer = () => {
  // fetch delegates
  const delegates = useNftHoldersWithVotingPower()
  // @TODO execution action from context (delegate)
  return (
    <div className="flex flex-row flex-wrap gap-[8px]">
      <Span>Input delegate to make governance decisions on your behalf</Span>
      {/* @TODO new input here */}
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
  )
}
