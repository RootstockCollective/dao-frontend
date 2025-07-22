'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useIsBacker } from '@/app/collective-rewards/rewards'
import { withBuilderSettingsProvider } from '@/app/collective-rewards/settings'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { CRWhitepaperLink } from '../collective-rewards/shared/components/CRWhitepaperLinkNew'
import { BackerRewards } from './backers/components/BackerRewards'
import { BuilderRewards } from './builder/components/BuilderRewards'
import { NonBacker } from './components'
import { BackerRewardsNotConnected } from './backers/components/BackerRewardsNotConnected'

const Section = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col w-full items-start gap-3 self-stretch pt-10 pb-10 pl-6 pr-6 bg-v3-bg-accent-80 rounded">
      {children}
    </div>
  )
}

const NAME = 'My Rewards'
export const MyRewardsPage = () => {
  const { address: userAddress, isConnected } = useAccount()
  const { data: isBacker } = useIsBacker(userAddress ?? zeroAddress)

  const {
    data: gauge,
    isLoading: gaugeLoading,
    error: gaugeError,
  } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [userAddress || zeroAddress],
  })

  useHandleErrors({ error: gaugeError, title: 'Error loading gauge' })
  if (gaugeLoading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <CycleContextProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
      >
        <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
          {NAME}
        </Header>
        <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
          <Section>
            <Paragraph className="flex items-start flex-1 basis-0">
              Track and claim the rewards you earn from backing Collective Rewards Builders. Claim Rewards and
              restake for higher Rewards and voting power.
            </Paragraph>
            <Paragraph className="flex flex-col items-start gap-2 flex-1 basis-0">
              <Span>Learn more about the Collective Rewards in the Whitepaper</Span>
              <Span>
                See the <CRWhitepaperLink>Whitepaper</CRWhitepaperLink>
              </Span>
            </Paragraph>
          </Section>
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
