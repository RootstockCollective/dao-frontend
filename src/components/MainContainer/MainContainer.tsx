'use client'
import { useAlertContext } from '@/app/providers'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Footer } from '@/components/Footer'
import { ConnectButton, Header } from '@/components/Header'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, ReactNode, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Alert } from '../Alert'
import { AccountAddress } from '../Header/AccountAddress'
import { DisconnectWalletModal } from '../Modal/DisconnectWalletModal'
import { ProtectedContent } from '../ProtectedContent/ProtectedContent'
import { MainContainerContent } from './MainContainerContent'

interface Props {
  children: ReactNode
  notProtected?: boolean
}

export const MainContainer: FC<Props> = ({ children, notProtected = false }) => {
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
    <>
      <div className="flex">
        <StatefulSidebar />
        <div className="flex flex-1 flex-col justify-between">
          <main className="px-[24px] mb-[100px]">
            {hasMounted && (
              <>
                <Header>
                  {isConnected ? (
                    <AccountAddress
                      address={address}
                      shortAddress={shortAddress(address)}
                      onLogoutClick={modal.openModal}
                    />
                  ) : (
                    <ConnectButton />
                  )}
                </Header>
                {modal.isModalOpened && (
                  <DisconnectWalletModal
                    onClose={modal.closeModal}
                    onConfirm={handleDisconnect}
                    onCancel={modal.closeModal}
                    address={address}
                  />
                )}
              </>
            )}
            {message && (
              <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
            )}
            <MainContainerContent notProtected={notProtected} setMessage={setMessage}>
              {children}
            </MainContainerContent>
          </main>
          <Footer variant="container" />
        </div>
      </div>
    </>
  )
}
