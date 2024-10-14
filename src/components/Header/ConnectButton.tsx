import { FC } from 'react'
import { useConnect } from 'wagmi'
import { Button } from '../Button'
import { useErrorThrowerContext } from '@/components/ErrorPage/ErrorThrowerContext'

interface Props {
  onSuccess?: () => void
  variant?: 'primary' | 'white'
  children?: string
}

export const ConnectButton: FC<Props> = ({ onSuccess, children = 'Connect wallet', variant = 'primary' }) => {
  const { connectors, connectAsync } = useConnect({
    mutation: { onSuccess },
  })
  const { triggerError } = useErrorThrowerContext()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connectAsync({ connector: connectors[connectors.length - 1] }).catch(err => {
        triggerError(err.toString())
      })
    }
  }

  return (
    <Button onClick={handleConnectWallet} variant={variant}>
      {children}
    </Button>
  )
}
