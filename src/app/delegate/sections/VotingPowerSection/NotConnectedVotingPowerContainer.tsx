import { CardsState } from '@/app/delegate/lib/types'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export const NotConnectedVotingPowerContainer = () => {
  const cards: CardsState = {
    available: {
      contentValue: <NotConnectedContent />,
    },
    own: {},
    received: {},
    delegated: {},
  }

  return <VotingPowerContainer cards={cards} />
}

export const NotConnectedContent = () => {
  const isDesktop = useIsDesktop()
  return (
    <span className="flex flex-row gap-1 items-center" data-testid="CardConnectButton">
      {isDesktop && '-'}
      <ConnectWorkflow />
    </span>
  )
}
