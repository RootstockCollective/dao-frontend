'use client'

import { useAccount } from 'wagmi'

import { usePermissionsManager } from '@/app/vault/hooks/usePermissionsManager'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NoPermissionsSection } from '@/components/NoPermissionsSection/NoPermissionsSection'
import { Header } from '@/components/Typography'

const NAME = 'Admin'

export const AdminPage = () => {
  const { isConnected } = useAccount()
  const { isAdmin, isLoading } = usePermissionsManager()

  if (!isConnected || isLoading) {
    return <LoadingSpinner />
  }

  if (!isAdmin) {
    return <NoPermissionsSection data-testid="AdminNoPermissions" />
  }

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <Header caps variant="h1" className="text-3xl leading-10 pb-10">
        {NAME}
      </Header>
    </div>
  )
}
