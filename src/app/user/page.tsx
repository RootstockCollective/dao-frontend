'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { withBuilderButton } from '@/app/collective-rewards/user'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useAccount } from 'wagmi'

const MyHoldings = () => (
  <>
    <TxStatusMessage messageType="staking" />
    <BalancesSection />
    <DelegationSection />
    <CommunitiesSection />
  </>
)

const TabsListWithButton = withBuilderButton(TabsList)

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

function User() {
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  return (
    <MainContainer>
      <Tabs defaultValue={defaultTabValue}>
        <TabsListWithButton>
          <TabsTrigger value={tabs.holdings.value}>
            <TabTitle>{tabs.holdings.title}</TabTitle>
          </TabsTrigger>
          <TabsTrigger value={tabs.rewards.value}>
            <TabTitle>{tabs.rewards.title}</TabTitle>
          </TabsTrigger>
        </TabsListWithButton>
        <TabsContent value={tabs.holdings.value}>
          <MyHoldings />
        </TabsContent>
        <TabsContent value={tabs.rewards.value}>
          <Rewards builder={address!} />
        </TabsContent>
      </Tabs>
    </MainContainer>
  )
}

export default function UserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <User />
    </Suspense>
  )
}
