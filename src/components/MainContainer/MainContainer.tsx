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
import { BecomeABuilderButton } from '@/app/bim/BecomeABuilderButton'

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
  const pathname = usePathname()

  const [hasMounted, setHasMounted] = useState(false)

  const handleDisconnect = () => {
    router.push('/')
    disconnect()
  }

  useEffect(() => {
    // Clear message on route change
    setMessage(null)
  }, [pathname, setMessage])

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  return (
    <>
      <div className="flex">
        <StatefulSidebar />
        <div className="flex-auto px-[24px] mb-[100px]">
          {hasMounted && (
            <>
              <Header>
                {isConnected ? (
                  <div className="flex flex-row justify-end gap-4">
                    <BecomeABuilderButton address={address} />
                    <AccountAddress
                      address={address}
                      shortAddress={shortAddress(address)}
                      onLogoutClick={modal.openModal}
                    />
                  </div>
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
          {message && <Alert {...message} onDismiss={() => setMessage(null)} />}
          {notProtected ? children : <ProtectedContent>{children}</ProtectedContent>}
        </div>
      </div>
      <Footer variant="container" />
    </>
  )
}
