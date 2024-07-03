'use client'
import { Header } from '@/components/Header'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, ReactNode, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { DisconnectWalletModal } from '@/app/login/DisconnectWalletModal'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => {
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
    <div className="flex">
      <StatefulSidebar />
      <div className="flex-auto">
        {isConnected && hasMounted && (
          <>
            <Header address={address} shortAddress={shortAddress(address)} onLogoutClick={modal.openModal} />
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
        {children}
      </div>
    </div>
  )
}
