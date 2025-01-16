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
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { useHandleErrors } from '../collective-rewards/utils'

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

const TabsListWithButton = withBuilderButton(TabsList)

type TabValue = 'holdings' | 'rewards'
interface Tab {
  value: TabValue
  title: string
}

const tabs: Record<TabValue, Tab> = {
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
          <TabsListWithButton>
            {Object.values(tabs).map((t, i) => (
              <TabsTrigger value={t.value} key={i + t.value}>
                <TabTitle>{t.title}</TabTitle>
              </TabsTrigger>
            ))}
          </TabsListWithButton>

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
