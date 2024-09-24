import { FC, ReactNode, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '../LoadingSpinner'
import { ConnectWalletModal } from '../Modal/ConnectWalletModal'

interface Props {
  children: ReactNode
}

export const ProtectedContent: FC<Props> = ({ children }) => {
  const { isConnected, isConnecting } = useAccount()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  if (!hasMounted || isConnecting) {
    return <LoadingSpinner />
  }

  return <>{isConnected ? children : <ConnectWalletModal />}</>
}
