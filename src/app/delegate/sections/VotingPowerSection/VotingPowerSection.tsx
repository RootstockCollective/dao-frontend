'use client'
import { useAccount } from 'wagmi'

import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'

import { NotConnectedVotingPowerContainer } from './NotConnectedVotingPowerContainer'

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
