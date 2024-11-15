'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { useGetBuilderToGauge, withBuilderButton } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useSearchParams } from 'next/navigation'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

type MyHoldingsProps = {
  showBuilderButton?: boolean
}

const MyHoldings = ({ showBuilderButton = false }: MyHoldingsProps) => (
  <>
    <TxStatusMessage messageType="staking" />
    <BalancesSection showBuilderButton={showBuilderButton} />
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

export default function User() {
  const { address } = useAccount()
  const { data: gauge, error } = useGetBuilderToGauge(address!)
  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  useHandleErrors({ error, title: 'Error loading gauge' })

  return (
    <MainContainer>
      {gauge && gauge !== zeroAddress ? (
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
            <MyHoldings showBuilderButton={false} />
          </TabsContent>
          <TabsContent value={tabs.rewards.value}>
            <Rewards builder={address!} gauge={gauge} />
          </TabsContent>
        </Tabs>
      ) : (
        <MyHoldings showBuilderButton={true} />
      )}
    </MainContainer>
  )
}
