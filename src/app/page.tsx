'use client'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Header/Logo'
import { config } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import classNames from 'classnames'
import { FaLink, FaUsers } from 'react-icons/fa'
import { WagmiProvider } from 'wagmi'
import { WalletOptions } from './login/WalletOptions'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-cover'

import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div>
      <div>{address}</div>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

export default function Home() {
  const queryClient = new QueryClient()

  const handleConnectWallet = () => {}
  const handleExploreCommunities = () => {}

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className={classNames(BACKGROUND_CLASSES, 'flex flex-col justify-center items-center h-screen')}>
          <Logo className="mb-8" />
          <div className="flex space-x-4">
            <Button onClick={handleConnectWallet} variant="primary" startIcon={<FaLink />}>
              Connect wallet
            </Button>
            <Button onClick={handleExploreCommunities} variant="secondary" startIcon={<FaUsers />}>
              Explore Communities
            </Button>
            <ConnectWallet />
          </div>
          <Footer />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
