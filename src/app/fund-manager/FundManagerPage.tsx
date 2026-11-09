'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PageTitle } from '@/components/PageBanner'
import { usePermissionsManager } from '@/shared/hooks/contracts'

import { RbtcVaultMetricsSection } from './components'
import { TabsSection } from './sections/TabsSection'

const NAME = 'Fund Manager Dashboard'

export const FundManagerPage = () => {
  const { isConnected } = useAccount()
  const { isFundManager, isLoading } = usePermissionsManager()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isConnected || !isFundManager)) {
      router.push('/')
    }
  }, [isConnected, isFundManager, isLoading, router])

  if (!isConnected || isLoading || !isFundManager) {
    return <LoadingSpinner />
  }

  return (
    <div data-testid={NAME} className="flex flex-col gap-10">
      <PageTitle>{NAME}</PageTitle>

      <RbtcVaultMetricsSection />
      <TabsSection />
    </div>
  )
}
