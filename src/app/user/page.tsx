'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { useHandleErrors } from '../collective-rewards/utils'
import { BecomeABuilderButton } from '../collective-rewards/user'

interface MyHoldingsProps {
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

  const { data: isBuilderOrBacker, isLoading, error } = useIsBuilderOrBacker(address ?? zeroAddress)

  useHandleErrors({
    error,
    title: 'Error fetching user data',
  })

  return (
    <MainContainer>
      {/* We don't show the tab if it's loading */}
      {!isLoading && isBuilderOrBacker ? (
        <Tabs defaultValue={defaultTabValue}>
          <div className="row-container">
            <TabsList>
              <TabsTrigger value={tabs.holdings.value}>
                <TabTitle>{tabs.holdings.title}</TabTitle>
              </TabsTrigger>
              <TabsTrigger value={tabs.rewards.value}>
                <TabTitle>{tabs.rewards.title}</TabTitle>
              </TabsTrigger>
            </TabsList>
            <BecomeABuilderButton address={address!} />
          </div>
          <TabsContent value={tabs.holdings.value}>
            <MyHoldings />
          </TabsContent>
          <TabsContent value={tabs.rewards.value}>
            <Rewards builder={address!} />
          </TabsContent>
        </Tabs>
      ) : (
        <MyHoldings showBuilderButton={true} />
      )}
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
