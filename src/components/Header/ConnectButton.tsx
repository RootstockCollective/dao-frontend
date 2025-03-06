import { FC } from 'react'
import { Button } from '../Button'
import { useWalletConnect } from '@/shared/hooks/useWalletConnect'

interface Props {
  onSuccess?: () => void
  variant?: 'primary' | 'white'
  children?: string
}

/**
 * @deprecated
 * @param onSuccess
 * @param children
 * @param variant
 * @constructor
 */
export const ConnectButton: FC<Props> = ({ onSuccess, children = 'Connect wallet', variant = 'primary' }) => {
  const { onConnect } = useWalletConnect({ onSuccess })
  return (
    <Button onClick={onConnect} variant={variant} data-testid="ConnectWallet">
      {children}
    </Button>
  )
}
