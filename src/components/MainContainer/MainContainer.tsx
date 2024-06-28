'use client'
import { Header } from '@/components/Header'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { shortAddress } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  const handleDisconnect = () => {
    router.push('/')
    disconnect()
  }

  return (
    <div className="flex">
      <StatefulSidebar />
      <div className="flex-auto">
        {isConnected && (
          <Header address={address} shortAddress={shortAddress(address)} onLogoutClick={handleDisconnect} />
        )}
        {children}
      </div>
    </div>
  )
}
