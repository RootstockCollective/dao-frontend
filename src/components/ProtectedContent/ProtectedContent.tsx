import { ConnectWalletModal } from '@/app/login/ConnectWalletModal'
import { FC, ReactNode } from 'react'
import { useAccount } from 'wagmi'

interface Props {
  children: ReactNode
}

export const ProtectedContent: FC<Props> = ({ children }) => {
  const { isConnected, isConnecting } = useAccount()
  return <>{isConnecting ? <div>Loading...</div> : <>{isConnected ? children : <ConnectWalletModal />}</>}</>
}
