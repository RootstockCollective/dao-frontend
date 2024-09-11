import { FC } from 'react'
import { useConnect } from 'wagmi'
import { Button } from '../Button'

interface Props {
  onSuccess?: () => void
  children: string
}

export const ConnectButton: FC<Props> = ({ onSuccess, children }) => {
  const { connectors, connect } = useConnect({
    mutation: { onSuccess },
  })

  const handleConnectWallet = () => {
    if (connectors.length) {
      connect({ connector: connectors[connectors.length - 1] })
    }
  }
  return (
    <Button onClick={handleConnectWallet} variant="white">
      {children}
    </Button>
  )
}
