'use client'
import { ReactNode } from 'react'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { UnderlineTabs, BaseTab } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { HeroSection } from './HeroSection'

const values = ['holdings', 'rewards'] as const
type TabValue = (typeof values)[number]

const tabs: BaseTab<TabValue>[] = [
  {
    value: 'holdings',
    label: 'My Holdings',
  },
  {
    value: 'rewards',
    label: 'My Rewards',
  },
]

export default function User() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabValue | null) ?? 'holdings'
  return (
    <>
      {/* We don't show the tab if it's loading */}
      {!isConnected && <HeroSection />}

      <UnderlineTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(newTab: TabValue) => router.push(`${pathName}?${new URLSearchParams({ tab: newTab })}`)}
      >
        <div className="pt-4">{tabsContent[activeTab]}</div>
      </UnderlineTabs>
    </>
  )
}

const tabsContent: Record<TabValue, ReactNode> = {
  holdings: (
    <>
      <TxStatusMessage messageType="staking" />
      <BalancesSection />
      <DelegationSection />
      <CommunitiesSection />
    </>
  ),
  rewards: <Rewards />,
}
