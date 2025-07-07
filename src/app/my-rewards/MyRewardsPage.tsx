'use client'

import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { CRWhitepaperLink } from '../collective-rewards/shared/components/CRWhitepaperLinkNew'
import { BuilderRewards } from './builder/components/BuilderRewards'
import { useAccount } from 'wagmi'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistry'
import { useHandleErrors } from '../collective-rewards/utils'
import { zeroAddress } from 'viem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ReactNode } from 'react'
import { CycleContextProvider } from '@/app/collective-rewards/metrics/context/CycleContext'

const Section = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-full items-start gap-3 self-stretch pt-10 pb-10 pl-6 pr-6 bg-v3-bg-accent-80 rounded">
      {children}
    </div>
  )
}

const NAME = 'My Rewards'
export const MyRewardsPage = () => {
  const { address, isConnected } = useAccount()

  const {
    data: gauge,
    isLoading: gaugeLoading,
    error: gaugeError,
  } = useReadBuilderRegistry({
    functionName: 'builderToGauge',
    args: [address || zeroAddress],
  })

  useHandleErrors({ error: gaugeError, title: 'Error loading gauge' })
  if (gaugeLoading) {
    return <LoadingSpinner size="large" />
  }

  if (!isConnected && !address) {
    //FIXME: we need to show a different component here
    return <div>PLACEHOLDER: Not connected</div>
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
          {gauge && gauge !== zeroAddress && <BuilderRewards address={address!} gauge={gauge} />}
          <Section>
            <Header variant="h3">Backer rewards PLACEHOLDER</Header>
          </Section>
        </div>
      </div>
    </CycleContextProvider>
  )
}
