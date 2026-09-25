'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useIsBacker } from '@/app/collective-rewards/rewards'
import { withBuilderSettingsProvider } from '@/app/collective-rewards/settings'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'

import { BackerRewards } from './backers/components/BackerRewards'
import { BackerRewardsNotConnected } from './backers/components/BackerRewardsNotConnected'
import { BuilderRewards } from './builder/components/BuilderRewards'
import { MyRewardsBanner, NonBacker } from './components'
import { Section } from './components/Section'

const NAME = 'My Rewards'
const MyRewardsPage = () => {
  const { address: userAddress, isConnected } = useAccount()
  const { data: isBacker } = useIsBacker(userAddress ?? zeroAddress)
  const router = useRouter()

  const {
    data: gauge,
    isLoading: gaugeLoading,
    error: gaugeError,
  } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [userAddress || zeroAddress],
  })

  useHandleErrors({ error: gaugeError, title: 'Error loading gauge' })

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (gaugeLoading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <CycleContextProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
      >
        <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
          <MyRewardsBanner />
          {gauge && gauge !== zeroAddress && userAddress && (
            <BuilderRewards address={userAddress} gauge={gauge} />
          )}
          {isConnected && !isBacker && (
            <>
              <Section>
                <NonBacker />
              </Section>
              <Section>
                <BackerRewardsNotConnected />
              </Section>
            </>
          )}
          {isConnected && isBacker && userAddress && (
            <Section>
              <BackerRewards backer={userAddress} />
            </Section>
          )}
        </div>
      </div>
    </CycleContextProvider>
  )
}

export default withBuilderSettingsProvider(MyRewardsPage)
