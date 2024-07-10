import { FaLink } from 'react-icons/fa6'
import { Button } from '../Button'
import { useConnect } from 'wagmi'

export const ConnectButton = () => {
  const { connectors, connect } = useConnect()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connect({ connector: connectors[connectors.length - 1] }, { onSuccess: () => router.push('/user') })
    }
  }
  return (
    <Button onClick={handleConnectWallet} variant="primary" startIcon={<FaLink />}>
      Connect wallet
    </Button>
  )
}
