'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useSearchParams } from 'next/navigation'
import { FC } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { useHandleErrors } from '../collective-rewards/utils'
import { HeaderTitle } from '@/components/Typography'
import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'
import { JustifyBetweenLayout } from '@/app/collective-rewards/shared'
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

type UserHeaderProps = {
  showAdditionalContent: boolean
}
const UserHeader: FC<UserHeaderProps> = ({ showAdditionalContent }) => {
  return (
    <>
      {showAdditionalContent ? (
        <TabsList>
          <TabsTrigger value={tabs.holdings.value}>
            <TabTitle>{tabs.holdings.title}</TabTitle>
          </TabsTrigger>
          <TabsTrigger value={tabs.rewards.value}>
            <TabTitle>{tabs.rewards.title}</TabTitle>
          </TabsTrigger>
        </TabsList>
      ) : (
        <HeaderTitle className="mb-6">Balances</HeaderTitle>
      )}
    </>
  )
}

const User = () => {
  const { address, isConnected } = useAccount()

  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  const { data: isBuilderOrBacker, isLoading, error } = useIsBuilderOrBacker(address ?? zeroAddress)

  useHandleErrors({
    error,
    title: 'Error fetching user data',
  })

  const showAdditionalContent = !isLoading && isBuilderOrBacker

  return (
    <>
      {/* We don't show the tab if it's loading */}
      <Tabs defaultValue={defaultTabValue}>
        {!isConnected && <HeroSection />}
        <JustifyBetweenLayout
          leftComponent={<UserHeader showAdditionalContent={showAdditionalContent} />}
          rightComponent={
            <>
              <SelfContainedNFTBoosterCard />
            </>
          }
        />
        <TabsContent value={tabs.holdings.value}>
          <TxStatusMessage messageType="staking" />
          <BalancesSection showTitle={showAdditionalContent} />
          <DelegationSection />
          <CommunitiesSection />
        </TabsContent>
        {showAdditionalContent ? (
          <TabsContent value={tabs.rewards.value}>
            <Rewards builder={address!} />
          </TabsContent>
        ) : null}
      </Tabs>
    </>
  )
}

export default User
