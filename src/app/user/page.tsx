'use client'
import { useAccount } from 'wagmi'
import { useSearchParams } from 'next/navigation'
import { IntroModal } from './sections/IntroModal'
import { LatestCollectiveSection } from './sections/LatestCollective'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'
import { TreasuryContextProviderWithPrices } from '../treasury/contexts/TreasuryContext'
import { TopHeroComponentNotConnected, CollectiveBalancesSection } from './sections'
import { StackingNotifications } from './sections/StackingNotifications/StackingNotifications'
import { CommunitiesSection } from './sections/Communities/CommunitiesSection'
import { MyActivitiesAndBalances } from './sections/MyActivitiesAndBalances'

export const MyHoldings = () => {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const { activeProposals, data: proposals } = useGetProposalsWithGraph()

  return (
    <div className="flex flex-col gap-2">
      {searchParams.get('action') !== 'stake' && <IntroModal />}

      {isConnected ? (
        <>
          <StackingNotifications />
          <MyActivitiesAndBalances />
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
