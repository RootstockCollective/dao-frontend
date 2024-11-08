'use client'
import { useGetIsWhitelistedBuilderV2, withBuilderButton } from '@/app/collective-rewards/builders'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { useAccount } from 'wagmi'

type MyHoldingsProps = {
  showBuilderButton?: boolean
}

const MyHoldings = ({ showBuilderButton = false }: MyHoldingsProps) => (
  <>
    <TxStatusMessage messageType="staking" />
    <BalancesSection showBuilderButton={showBuilderButton} />
    <CommunitiesSection />
  </>
)

const TabsListWithButton = withBuilderButton(TabsList)

export default function User() {
  const { address } = useAccount()

  const { data: isWhitelistedBuilder } = useGetIsWhitelistedBuilderV2(address!)

  return (
    <MainContainer>
      {isWhitelistedBuilder ? (
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
            <Rewards builder={address!} />
          </TabsContent>
        </Tabs>
      ) : (
        <MyHoldings showBuilderButton={true} />
      )}
    </MainContainer>
  )
}
