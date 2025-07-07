import { CardsState } from '@/app/delegate/lib/types'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'

export const NotConnectedVotingPowerContainer = () => {
  const cards: CardsState = {
    available: {
      contentValue: (
        <span className="flex flex-row max-h-[20px] gap-[4px] items-center" data-testid="CardConnectButton">
          <span>-</span>
          <ConnectWorkflow />
        </span>
      ),
    },
    own: {},
    received: {},
    delegated: {},
  }

  return <VotingPowerContainer cards={cards} />
}
