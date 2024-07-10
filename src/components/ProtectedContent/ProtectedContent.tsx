import { ConnectWalletModal } from '@/app/login/ConnectWalletModal'
import { useRouter } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { useAccount, useConnect } from 'wagmi'

interface Props {
  children: ReactNode
}

export const ProtectedContent: FC<Props> = ({ children }) => {
  const { connectors, connect } = useConnect()
  const router = useRouter()
  const { isConnected, isConnecting } = useAccount()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connect({ connector: connectors[connectors.length - 1] }, { onSuccess: () => router.push('/user') })
    }
  }

  return (
    <>
      {isConnecting ? (
        <div>Loading...</div>
      ) : (
        <>
          {isConnected ? (
            children
          ) : (
            <ConnectWalletModal onConfirm={handleConnectWallet} onCancel={() => router.push('/')} />
          )}
        </>
      )}
    </>
  )
}
