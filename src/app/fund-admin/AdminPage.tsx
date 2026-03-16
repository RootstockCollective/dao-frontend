'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'
import { usePermissionsManager } from '@/shared/hooks/contracts'

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
