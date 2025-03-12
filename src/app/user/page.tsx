'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { HeroSection } from './HeroSection'

const values = ['holdings', 'rewards'] as const

type TabValue = (typeof values)[number]
type Tabs = {
  [key in TabValue]: {
    value: key
    title: string
  }
}
const tabs: Tabs = {
  holdings: {
    value: 'holdings',
    title: 'My Holdings',
  },
  rewards: {
    value: 'rewards',
    title: 'My Rewards',
  },
}

const User = () => {
  const { isConnected } = useAccount()

  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  return (
    <>
      {/* We don't show the tab if it's loading */}
      <Tabs defaultValue={defaultTabValue}>
        {!isConnected && <HeroSection />}
        <TabsList>
          <TabsTrigger value={tabs.holdings.value}>
            <TabTitle>{tabs.holdings.title}</TabTitle>
          </TabsTrigger>
          <TabsTrigger value={tabs.rewards.value}>
            <TabTitle>{tabs.rewards.title}</TabTitle>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tabs.holdings.value}>
          <TxStatusMessage messageType="staking" />
          <BalancesSection />
          <DelegationSection />
          <CommunitiesSection />
        </TabsContent>
        <TabsContent value={tabs.rewards.value}>
          <Rewards />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default User
