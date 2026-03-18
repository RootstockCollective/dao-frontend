import 'server-only'

import type { Metadata } from 'next'

import { Header } from '@/components/Typography'

import { AddAddressesForm } from './AddAddressesForm'
import { ContractsReadSpinner } from './ContractsReadSpinner'
import { ContractWriteSpinner } from './ContractWriteSpinner'
import { MintersTable } from './MintersTable'

export const metadata: Metadata = {
  title: 'Rootcamp NFT',
}

/** Admin page for managing Rootcamp NFT minting whitelist and permissions. */
export default async function RcNft() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Header variant="h2" caps className="text-brand-rootstock-pink">
          Rootcamp NFT
        </Header>
        <div className="w-6 h-6 flex items-center justify-center">
          <ContractsReadSpinner />
        </div>
      </div>
      <AddAddressesForm className="mb-10" />
      <MintersTable />
      <ContractWriteSpinner />
    </div>
  )
}
