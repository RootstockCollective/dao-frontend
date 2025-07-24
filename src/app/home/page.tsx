'use client'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'
import { LatestCollectiveSection } from '../my-holdings/sections/latest-collective'
import { TreasuryContextProviderWithPrices } from '../treasury/contexts/TreasuryContext'
import { useAccount } from 'wagmi'
import { TopHeroComponentNotConnected, CollectiveBalancesSection } from './components'
import { CommunitiesSection } from '../my-holdings/sections/Communities/CommunitiesSection'

export default function Home() {
  const { isConnected } = useAccount()
  const { activeProposals, data } = useGetProposalsWithGraph()

  return (
    <div className="bg-bg-100 px-6">
      {!isConnected ? (
        <>
          <TopHeroComponentNotConnected />
          <TreasuryContextProviderWithPrices>
            <CollectiveBalancesSection />
          </TreasuryContextProviderWithPrices>
        </>
      ) : null}
      <LatestCollectiveSection
        latestProposals={data.slice(0, 3)}
        activeProposal={isConnected ? activeProposals[0] : undefined}
      />
      {!isConnected ? (
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
      ) : null}
    </div>
  )
}
