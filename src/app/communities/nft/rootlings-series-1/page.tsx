import 'server-only'

import type { Metadata } from 'next'
import { Header } from '@/components/Typography'
import { ContractsReadSpinner } from './ContractsReadSpinner'
import { MintersTable } from './MintersTable'

export const metadata: Metadata = {
  title: 'Rootlings Series 1',
}

export default async function RootlingsSeries1() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Header variant="h2" caps className="text-brand-rootstock-pink">
          Rootling Series 1
        </Header>
        <div className="w-6 h-6 flex items-center justify-center">
          <ContractsReadSpinner />
        </div>
      </div>
      <MintersTable />
    </div>
  )
}
