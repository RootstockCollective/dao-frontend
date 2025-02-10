'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { DelegationSection } from '@/app/user/Delegation'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'next-client-cookies'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useIsBuilderOrBacker } from '../collective-rewards/rewards/hooks/useIsBuilderOrBacker'
import { useHandleErrors } from '../collective-rewards/utils'
import { BecomeABuilderButton } from '../collective-rewards/user'
import { Dropdown, DropdownItem, DropdownTopic, getStartedData } from '@/components/dropdown'
import { dropdown } from '@/shared/contants'
import { HeaderTitle, Typography } from '@/components/Typography'
import { BalancesProvider, useBalancesContext } from './Balances/context/BalancesContext'
import { TokenBalanceRecord } from './types'
import { RBTC, RIF, stRIF } from '@/lib/constants'
import Big from 'big.js'

const getStartedSkipped = 'getStartedSkipped'
const values = ['holdings', 'rewards'] as const
const COMPLETED = 'COMPLETED'

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


const checkSteps = (items: DropdownItem[],  balances: TokenBalanceRecord) => {
  if (Big(balances[stRIF].balance).gt(0)) {
    return [
      {
        items: items.slice(3),
      },
      {
        topic: COMPLETED,
        items: items.slice(0, 3),
      },
    ]
  }

  if (Big(balances[RIF].balance).gt(0)) {
    return [
      { items: items.slice(2) },
      { topic: COMPLETED, items: items.slice(0, 2) },
    ]
  }

  if (Big(balances[RBTC].balance).gt(0)) {
    return [
      { items: items.slice(1) },
      {  topic: COMPLETED, items: items.filter(step => step.id === RBTC) },
    ]
  }

  return [{ items }]
}



function User() {
  const { balances } = useBalancesContext()

  // Getting Started dropdown
  const router = useRouter()
  const coockies = useCookies()
  const isGetStatedSkipped = useMemo(() => Boolean(coockies.get(getStartedSkipped)), [coockies])
  const [dropdownData, setDropdownData] = useState<DropdownTopic[]>([])

  const { address } = useAccount()
  const searchParams = useSearchParams()
  const tabFromParams = searchParams?.get('tab') as TabValue
  const defaultTabValue = tabs[tabFromParams]?.value ?? 'holdings'

  const { data: isBuilderOrBacker, isLoading, error } = useIsBuilderOrBacker(address ?? zeroAddress)

  useHandleErrors({
    error,
    title: 'Error fetching user data',
  })

  const skipGetStarted = useCallback(async () => {
    coockies.set(getStartedSkipped, 'true')
  }, [coockies])

  useEffect(() => {
    if (!isGetStatedSkipped) {
      setDropdownData(checkSteps(getStartedData(router)[0].items, balances))
    }
  }, [balances, isGetStatedSkipped])

  const showAdditionalContent = !isLoading && isBuilderOrBacker

  return (
    <MainContainer>
      {/* We don't show the tab if it's loading */}
      <Tabs defaultValue={defaultTabValue}>
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

          {!isGetStatedSkipped ? (
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

          <BecomeABuilderButton address={address!} />
        </div>

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
