'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'

import { AddAddressesForm } from './AddAddressesForm'
import { MintersTable } from './MintersTable'
import { useRcNft } from './useRcNft'

/** Admin page for managing Rootcamp NFT minting whitelist and permissions. */
export default function RcNft() {
  const { loading, pending } = useRcNft()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Header variant="h2" caps className="text-brand-rootstock-pink">
          Rootcamp NFT
        </Header>
        <div className="w-6 h-6 flex items-center justify-center">
          {loading && <LoadingSpinner size="small" />}
        </div>
      </div>
      <AddAddressesForm className="mb-10" />
      <MintersTable />
      {pending && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-base">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
