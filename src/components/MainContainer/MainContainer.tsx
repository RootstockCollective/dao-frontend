'use client'
import { Header } from '@/components/Header'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, ReactNode } from 'react'
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
  
  const handleDisconnect = () => {
    router.push('/')
    disconnect()
  }

  return (
    <div className="flex">
      <StatefulSidebar />
      <div className="flex-auto">
        {isConnected && (
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
