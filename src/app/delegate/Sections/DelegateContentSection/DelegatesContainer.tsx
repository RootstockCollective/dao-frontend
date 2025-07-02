import { DelegateCard } from '@/app/delegate/components'
import { Address } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'

export const DelegatesContainer = () => {
  // fetch delegates
  const delegates = useNftHoldersWithVotingPower()
  // @TODO execution action from context (delegate)
  return (
    <div className="flex flex-row flex-wrap gap-[8px]">
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
