'use client'

import { useAccount } from 'wagmi'

import { usePermissionsManager } from '@/app/vault/hooks/usePermissionsManager'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NoPermissionsSection } from '@/components/NoPermissionsSection/NoPermissionsSection'
import { Header } from '@/components/Typography'

import { RbtcVaultMetricsSection } from './components'

const NAME = 'Fund Manager Dashboard'

export const FundManagerPage = () => {
  const { isConnected } = useAccount()
  const { isFundManager, isLoading } = usePermissionsManager()

  if (!isConnected || isLoading) {
    return <LoadingSpinner />
  }

  if (!isFundManager) {
    return <NoPermissionsSection data-testid="FundManagerNoPermissions" />
  }

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-10">
        {NAME}
      </Header>
      <RbtcVaultMetricsSection />
    </div>
  )
}
