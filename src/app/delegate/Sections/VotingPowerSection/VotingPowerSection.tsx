'use client'
import { useAccount } from 'wagmi'
import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'
import { NotConnectedVotingPowerContainer } from './NotConnectedVotingPowerContainer'
import { useDelegateContext } from '@/app/delegate/components/DelegateContext'

export const VotingPowerSection = () => {
  const { isConnected } = useAccount()

  return (
    <div className="my-[8px]">
      {!isConnected && <NotConnectedVotingPowerContainer />}
      {isConnected && <ConnectedVotingPowerContainer />}
    </div>
  )
}

const ConnectedVotingPowerContainer = () => {
  const { cards } = useDelegateContext()

  return <VotingPowerContainer cards={cards} />
}
