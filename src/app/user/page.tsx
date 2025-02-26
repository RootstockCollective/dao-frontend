'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, Suspense, useCallback, useEffect, useState } from 'react'
import { useCookiesNext } from 'cookies-next'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { useHandleErrors } from '../collective-rewards/utils'
import { COMPLETED, Dropdown, DropdownTopic, getGetStartedData } from '@/components/dropdown'
import { dropdown } from '@/shared/contants'
import { HeaderTitle, Typography } from '@/components/Typography'
import { BalancesProvider, useBalancesContext } from './Balances/context/BalancesContext'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { TokenBalanceRecord } from './types'
import { Timeout } from 'react-number-format/types/types'
import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'
import { BecomeABuilderButton } from '@/app/collective-rewards/user'
import { JustifyBetweenLayout } from '@/app/collective-rewards/shared'

const getStartedSkipped = 'getStartedSkipped'
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

let interval: Timeout | undefined = undefined

const getStartedCheckRunner = (fn: () => Promise<void>) => {
  if (!interval) fn()
  else {
    clearInterval(interval)
  }

  interval = setInterval(() => {
    fn()
  }, 60000)
}

type UserHeaderProps = {
  showAdditionalContent: boolean
}
const UserHeader: FC<UserHeaderProps> = ({ showAdditionalContent }) => {
  const { balances, isBalancesLoading } = useBalancesContext()
  const { address } = useAccount()

  // Getting Started dropdown
  const router = useRouter()
  const cookies = useCookiesNext()
  const [isGetStatedSkipped, setIsGetStartedSkipped] = useState<boolean>(true)

  const [dropdownData, setDropdownData] = useState<DropdownTopic[] | null>(null)

  const skipGetStarted = useCallback(async () => {
    cookies.setCookie(getStartedSkipped, true)
    setIsGetStartedSkipped(true)
  }, [cookies])

  const setGetStartedDropdownData = useCallback(
    async (router: AppRouterInstance, balances: TokenBalanceRecord, address: Address) => {
      const dropdownData = await getGetStartedData(router, balances, address)
      setDropdownData(dropdownData)
    },
    [],
  )

  useEffect(() => {
    // TODO: check how often the dependencies update to minimize re-render
    // TODO: find a better way to cache and refresh the getStartedSteps
    if (address && !isBalancesLoading) {
      getStartedCheckRunner(() => setGetStartedDropdownData(router, balances, address))
    }
  }, [router, balances, isBalancesLoading, address, setGetStartedDropdownData])

  useEffect(() => {
    setIsGetStartedSkipped(Boolean(cookies.getCookie(getStartedSkipped)))
  }, [isGetStatedSkipped, cookies])

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

      {!isGetStatedSkipped && dropdownData ? (
        <Dropdown
          title={dropdown.steps}
          subtitle={`(${dropdownData[1] ? dropdownData[1].items.length : '0'}/5 ${COMPLETED})`}
          description={dropdown.influencerDesc}
          data={dropdownData}
          footer={
            <Typography
              className="text-[12px] text-center leading-none text-[#171412] font-normal font-rootstock-sans hover:underline"
              cursor="pointer"
              onClick={skipGetStarted}
            >
              {dropdown.already_familiar}
            </Typography>
          }
        />
      ) : null}
    </>
  )
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

  const showAdditionalContent = !isLoading && isBuilderOrBacker

  return (
    <MainContainer>
      {/* We don't show the tab if it's loading */}
      <Tabs defaultValue={defaultTabValue}>
        <JustifyBetweenLayout
          leftComponent={<UserHeader showAdditionalContent={showAdditionalContent} />}
          rightComponent={
            <>
              <SelfContainedNFTBoosterCard />
              <BecomeABuilderButton address={address!} />
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
    </MainContainer>
  )
}

export default function UserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BalancesProvider>
        <User />
      </BalancesProvider>
    </Suspense>
  )
}
