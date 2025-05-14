'use client'
import { useAlertContext } from '@/app/providers'
import { Footer } from '@/components/Footer'
import { TopPageHeader } from '@/shared/walletConnection/components/topPageHeader/TopPageHeader'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { FC, ReactNode, Suspense } from 'react'
import { Alert } from '../Alert'
import { GradientHeader } from '@/components/GradientHeader/GradientHeader'
import Scroll from '@/components/Scroll'
import { currentEnvChain } from '@/config'
import { useAccount } from 'wagmi'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => {
  const { isConnected, chainId } = useAccount()
  const { message, setMessage } = useAlertContext()

  const wrongNetwork = chainId !== currentEnvChain.id
  const shouldDisplayContent = !isConnected || !wrongNetwork

  return (
    <Suspense fallback="Loading...">
      <GradientHeader />
      <div className="flex h-screen">
        <StatefulSidebar />
        <Scroll />
        <div className="flex flex-1 flex-col justify-between overflow-y-auto mt-10 ml-72" id="main-container">
          <main className="px-[32px] py-[34px] mb-[100px]">
            {message && (
              <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
            )}
            {shouldDisplayContent && (
              <>
                <TopPageHeader />
                {children}
              </>
            )}
          </main>
          <Footer variant="container" />
        </div>
      </div>
    </Suspense>
  )
}
