import { CardsState } from '@/app/delegate/components/types'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'

export const NotConnectedVotingPowerContainer = () => {
  const cards: CardsState = {
    available: {
      contentValue: (
        <div className="flex flex-row h-max-[32px]">
          - <ConnectWorkflow />
        </div>
      ),
    },
    own: {},
    received: {},
    delegated: {},
  }

  return <VotingPowerContainer cards={cards} />
}
