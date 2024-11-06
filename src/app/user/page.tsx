'use client'
import { Rewards } from '@/app/collective-rewards/rewards/MyRewards'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabTitle } from '@/components/Tabs'
import { useAccount } from 'wagmi'
import { withBuilderButton, useGetBuilderToGauge } from '@/app/collective-rewards/user'
import { useAlertContext } from '@/app/providers'
import { useEffect } from 'react'
import { TxStatusMessage } from '@/components/TxStatusMessage'
import { zeroAddress } from 'viem'

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
  const { setMessage } = useAlertContext()
  const { address } = useAccount()
  const { data: gauge, error: gaugeError } = useGetBuilderToGauge(address!)

  useEffect(() => {
    if (gaugeError) {
      setMessage({
        severity: 'error',
        title: 'Error loading gauge',
        content: gaugeError.message,
      })
      console.error('🐛 gaugeError:', gaugeError)
    }
  }, [gaugeError, setMessage])

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
