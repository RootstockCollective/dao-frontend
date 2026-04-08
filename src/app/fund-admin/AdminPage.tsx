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
  const { isAdmin, isPauser, isLoading } = usePermissionsManager()
  const router = useRouter()
  const hasAccess = isAdmin || isPauser

  useEffect(() => {
    if (!isLoading && (!isConnected || !hasAccess)) {
      router.push('/')
    }
  }, [isConnected, hasAccess, isLoading, router])

  if (!isConnected || isLoading || !hasAccess) {
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
