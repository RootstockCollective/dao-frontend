'use client'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs'
import { Rewards } from '@/app/bim/Rewards'
import { useAccount } from 'wagmi'
import { useGetIsWhitelistedBuilder } from '@/app/bim/hooks/useGetIsWhitelistedBuilder'

const MyHoldings = () => (
  <>
    <TxStatusMessage messageType="staking" />
    <BalancesSection />
    <CommunitiesSection />
  </>
)

export default function User() {
  const { address } = useAccount()

  const { data: isWhitelistedBuilder } = useGetIsWhitelistedBuilder(address!)

  return (
    <MainContainer>
      {isWhitelistedBuilder ? (
        <Tabs defaultValue="holdings">
          <TabsList className="pb-[25px]">
            <TabsTrigger value="holdings">My Holdings</TabsTrigger>
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
          </TabsList>
          <TabsContent value="holdings">
            <MyHoldings />
          </TabsContent>
          <TabsContent value="rewards">
            <Rewards builder={address!} />
          </TabsContent>
        </Tabs>
      ) : (
        <MyHoldings />
      )}
    </MainContainer>
  )
}
