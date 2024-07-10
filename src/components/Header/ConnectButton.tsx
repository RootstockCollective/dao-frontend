import { FC } from 'react'
import { FaLink } from 'react-icons/fa6'
import { useConnect } from 'wagmi'
import { Button } from '../Button'

interface Props {
  onSuccess?: () => void
}

export const ConnectButton: FC<Props> = ({ onSuccess }) => {
  const { connectors, connect } = useConnect({
    mutation: { onSuccess },
  })

  const handleConnectWallet = () => {
    if (connectors.length) {
      connect({ connector: connectors[connectors.length - 1] })
    }
  }
  return (
    <Button onClick={handleConnectWallet} variant="primary" startIcon={<FaLink />}>
      Connect wallet
    </Button>
  )
}
