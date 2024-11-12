'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { useAccount } from 'wagmi'
import { withBuilderButton, useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { zeroAddress } from 'viem'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { DelegationSection } from './Delegation'

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

export default function User() {
  const { address } = useAccount()
  const { data: gauge, error } = useGetBuilderToGauge(address!)

  useHandleErrors({ error, title: 'Error loading gauge' })

  return (
    <MainContainer>
      {gauge && gauge !== zeroAddress ? (
        <Tabs defaultValue="holdings">
          <TabsListWithButton>
            <TabsTrigger value="holdings">
              <TabTitle>My Holdings</TabTitle>
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <TabTitle>My Rewards</TabTitle>
            </TabsTrigger>
          </TabsListWithButton>
          <TabsContent value="holdings">
            <MyHoldings showBuilderButton={false} />
          </TabsContent>
          <TabsContent value="rewards">
            <Rewards builder={address!} gauge={gauge} />
          </TabsContent>
        </Tabs>
      ) : (
        <MyHoldings showBuilderButton={true} />
      )}
    </MainContainer>
  )
}
