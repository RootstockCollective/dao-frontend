import 'server-only'

import type { Metadata } from 'next'
import { Header } from '@/components/Typography'
import { MintersTable } from './MintersTable'

export const metadata: Metadata = {
  title: 'Rootlings Series 1',
}

export default async function RootlingsSeries1() {
  return (
    <div>
      <Header variant="h2" caps className="mb-6 text-brand-rootstock-pink">
        Rootling Series 1
      </Header>

      <MintersTable />
    </div>
  )
}
