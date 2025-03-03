'use client'
import { useAlertContext } from '@/app/providers'
import { useModal } from '@/shared/hooks/useModal'
import { Footer } from '@/components/Footer'
import { ConnectButton, Header } from '@/components/Header'
import { PageHeader } from '@/app/_user-connection/PageHeader'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, Suspense, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Alert } from '../Alert'
import { AccountAddress } from '../Header/AccountAddress'
import { DisconnectWalletModal } from '../Modal/DisconnectWalletModal'
import { MainContainerContent } from './MainContainerContent'
import { GradientHeader } from '@/components/GradientHeader/GradientHeader'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { message, setMessage } = useAlertContext()
  const router = useRouter()
  const modal = useModal()

  const [hasMounted, setHasMounted] = useState(false)

  const handleDisconnect = () => {
    router.push('/')
    disconnect()
  }

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradientHeader />
      <div className="flex h-screen">
        <StatefulSidebar />
        <div className="flex flex-1 flex-col justify-between overflow-y-auto mt-10 ml-72">
          <main className="px-[32px] py-[34px] mb-[100px]">
            {message && (
              <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
            )}
            <PageHeader />
            <MainContainerContent setMessage={setMessage}>{children}</MainContainerContent>
          </main>
          <Footer variant="container" />
        </div>
      </div>
    </Suspense>
  )
}
