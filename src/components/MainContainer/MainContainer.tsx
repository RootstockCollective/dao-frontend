'use client'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { ConnectButton, Header } from '@/components/Header'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { AccountAddress } from '../Header/AccountAddress'
import { DisconnectWalletModal } from '../Modal/DisconnectWalletModal'
import { ProtectedContent } from '../ProtectedContent/ProtectedContent'

interface Props {
  children: ReactNode
  notProtected?: boolean
}

export const MainContainer: FC<Props> = ({ children, notProtected = false }) => {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
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
    <div className="flex container">
      <StatefulSidebar />
      <div className="flex-auto">
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
        {notProtected ? children : <ProtectedContent>{children}</ProtectedContent>}
      </div>
    </div>
  )
}
