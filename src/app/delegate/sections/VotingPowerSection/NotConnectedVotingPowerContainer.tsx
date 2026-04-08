import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'
import { CardsState } from '@/app/delegate/lib/types'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

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
