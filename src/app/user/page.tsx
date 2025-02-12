'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { COMPLETED, Dropdown, DropdownTopic, getGetStartedData } from '@/components/dropdown'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { HeaderTitle, Typography } from '@/components/Typography'
import { dropdown } from '@/shared/contants'
import { useCookiesNext } from 'cookies-next'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { Timeout } from 'react-number-format/types/types'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { withBuilderButton } from '../collective-rewards/user/components/Button/WithBuilderButton'
import { useHandleErrors } from '../collective-rewards/utils'
import { BalancesProvider, useBalancesContext } from './Balances/context/BalancesContext'
import { TokenBalanceRecord } from './types'
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

const getStartedCheckRunner = (fn: () => Promise<void>) => {
  let interval: Timeout | undefined = undefined

  if (interval) {
    clearInterval(interval)
  }

  fn()
  interval = setInterval(() => {
    fn()
  }, 60000)
}

interface UserHeaderProps {
  showAdditionalContent: boolean
  isGetStatedSkipped: boolean
  dropdownData: DropdownTopic[] | null
  skipGetStarted: () => Promise<void>
  tabs: {
    holdings: { value: string; title: string }
    rewards: { value: string; title: string }
  }
}

const UserHeader: React.FC<UserHeaderProps> = ({
  showAdditionalContent,
  isGetStatedSkipped,
  dropdownData,
  skipGetStarted,
  tabs,
}) => {
  return (
    <div className="row-container">
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
    </div>
  )
}

function User() {
  const { balances } = useBalancesContext()
  const { address } = useAccount()

  // Getting Started dropdown
  const router = useRouter()
  const coockies = useCookiesNext()
  const [isGetStatedSkipped, setIsGetStartedSkipped] = useState<boolean>(true)
  const [dropdownData, setDropdownData] = useState<DropdownTopic[] | null>(null)

  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  const { data: isBuilderOrBacker, isLoading, error } = useIsBuilderOrBacker(address ?? zeroAddress)

  useHandleErrors({
    error,
    title: 'Error fetching user data',
  })

  const skipGetStarted = useCallback(async () => {
    coockies.setCookie(getStartedSkipped, true)
    setIsGetStartedSkipped(true)
  }, [coockies])

  const setGetStartedDropdownData = useCallback(
    async (router: AppRouterInstance, balances: TokenBalanceRecord, address: Address) => {
      const dropdownData = await getGetStartedData(router, balances, address)
      setDropdownData(dropdownData)
    },
    [],
  )

  useEffect(() => {
    // TODO: check how often the dependecies update to minimize re-render
    // TODO: find a better way to cache and refresh the getStartedSteps
    if (address) {
      getStartedCheckRunner(() => setGetStartedDropdownData(router, balances, address))
    }
  }, [router, balances, address, setGetStartedDropdownData])

  const showAdditionalContent = !isLoading && isBuilderOrBacker

  useEffect(() => {
    setIsGetStartedSkipped(Boolean(coockies.getCookie(getStartedSkipped)))
  }, [isGetStatedSkipped, coockies])

  return (
    <MainContainer>
      {/* We don't show the tab if it's loading */}
      <Tabs defaultValue={defaultTabValue}>
        {withBuilderButton(UserHeader)({
          showAdditionalContent,
          isGetStatedSkipped,
          dropdownData,
          skipGetStarted,
          tabs,
        })}

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
