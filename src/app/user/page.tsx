'use client'

import { ReactNode, useMemo } from 'react'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { UnderlineTabs, BaseTab } from '@/components/Tabs'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { HeroSection } from './HeroSection'
import { IntroModal } from './IntroModal'

const values = ['holdings', 'rewards'] as const
type TabValue = (typeof values)[number]
const [defaultTab] = values

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

  const activeTab = useMemo<TabValue>(() => {
    const currentTab = (searchParams.get('tab') ?? defaultTab) as TabValue
    // if selected tab doesn't exist display default tab
    return values.includes(currentTab) ? currentTab : defaultTab
  }, [searchParams])

  const tabsContent: Record<TabValue, ReactNode> = {
    holdings: (
      <>
        {searchParams.get('action') !== 'stake' && <IntroModal />}
        <BalancesSection />
        <DelegationSection />
        <CommunitiesSection />
      </>
    ),
    rewards: <Rewards />,
  }

  return (
    <>
      {!isConnected && <HeroSection />}
      <UnderlineTabs
        layoutId="user-tab"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(newTab: TabValue) => router.push(`${pathName}?${new URLSearchParams({ tab: newTab })}`)}
      >
        <div className="pt-4">{tabsContent[activeTab]}</div>
      </UnderlineTabs>
    </>
  )
}
