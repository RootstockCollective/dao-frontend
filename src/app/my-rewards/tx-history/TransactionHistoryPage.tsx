'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withBuilderSettingsProvider } from '@/app/collective-rewards/settings'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'

const NAME = 'Transactions History'
const TransactionHistoryPage = () => {
  const { address: userAddress, isConnected } = useAccount()
  const router = useRouter()

  return (
    <CycleContextProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
      >
        <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
          {NAME}
        </Header>
      </div>
    </CycleContextProvider>
  )
}

export default withBuilderSettingsProvider(TransactionHistoryPage)
