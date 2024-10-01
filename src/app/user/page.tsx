'use client'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs'
import { Rewards } from '@/app/bim/Rewards'

export default function User() {
  return (
    <MainContainer>
      <Tabs defaultValue="holdings">
        <TabsList className="pb-[25px]">
          <TabsTrigger value="holdings">My Holdings</TabsTrigger>
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings">
          <TxStatusMessage messageType="staking" />
          <BalancesSection />
          <CommunitiesSection />
        </TabsContent>
        <TabsContent value="rewards">
          <Rewards />
        </TabsContent>
      </Tabs>
    </MainContainer>
  )
}
