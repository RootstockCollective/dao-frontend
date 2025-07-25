'use client'

import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { IntroModal } from './IntroModal'
import { StackingNotifications } from '@/app/user/StackingNotifications/StackingNotifications'
import { TreasuryContextProviderWithPrices } from '../treasury/contexts/TreasuryContext'
import { MyActivityAndBalances } from './my-holdings/MyActivityAndBalances'
import { TopHeroComponentNotConnected } from '../home/components/top-hero'
import { CollectiveBalancesSection } from '../home/components/collective-balances-section'
import { LatestCollectiveSection } from './latest-collective'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'

export default function User() {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const { activeProposals, data: proposals } = useGetProposalsWithGraph()

  return (
    <div className="flex flex-col gap-2">
      {searchParams.get('action') !== 'stake' && <IntroModal />}

      {isConnected ? (
        <>
          <StackingNotifications />
          <MyActivityAndBalances />
        </>
      ) : (
        <>
          <TopHeroComponentNotConnected />
          <TreasuryContextProviderWithPrices>
            <CollectiveBalancesSection />
          </TreasuryContextProviderWithPrices>
        </>
      )}
      <LatestCollectiveSection
        latestProposals={proposals.slice(0, 3)}
        activeProposal={isConnected ? activeProposals[0] : undefined}
      />
      <CommunitiesSection
        heroComponentConfig={{
          className: 'mt-2',
          imageSrc: '/images/hero/home-hero-bottom.png',
          title: 'BE PART OF THE COMMUNITIES',
          subtitle: 'CURATED BY THE COLLECTIVE',
          items: [
            'Collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
            'Whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
            'Be part of something bigger, helping shape the future of Bitcoin.',
            'These aren’t just collectibles. They are your passport to participation.',
          ],
        }}
      />
    </div>
  )
}
