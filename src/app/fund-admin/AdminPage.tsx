'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'
import { usePermissionsManager } from '@/shared/hooks/contracts'

import { TabsSection } from './sections/TabsSection'

const NAME = 'Admin'

export const AdminPage = () => {
  const { isConnected } = useAccount()
  const { isAdmin, isLoading } = usePermissionsManager()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isConnected || !isAdmin)) {
      router.push('/')
    }
  }, [isConnected, isAdmin, isLoading, router])

  if (!isConnected || isLoading || !isAdmin) {
    return <LoadingSpinner />
  }

  return (
    <div data-testid={NAME} className="flex flex-col gap-10">
      <Header caps variant="h1">
        {NAME}
      </Header>
      <TabsSection />
    </div>
  )
}
