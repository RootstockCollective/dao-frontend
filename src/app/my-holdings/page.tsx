'use client'
import { useAccount } from 'wagmi'
import { useSearchParams } from 'next/navigation'
import { IntroModal } from './sections/IntroModal'
import { LatestCollectiveSection } from './sections/latest-collective'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'
import { TreasuryContextProviderWithPrices } from '../treasury/contexts/TreasuryContext'
import { TopHeroComponentNotConnected } from '../home/components'
import { CollectiveBalancesSection } from '../home/components'
import { StackingNotifications } from './sections/StackingNotifications/StackingNotifications'
import { CommunitiesSection } from './sections/Communities/CommunitiesSection'
import { MyActivitiesAndBalances } from './sections/MyActivitiesAndBalances'

export const MyHoldings = () => {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const { activeProposals, data } = useGetProposalsWithGraph()

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
        latestProposals={data.slice(0, 3)}
        activeProposal={isConnected ? activeProposals[0] : undefined}
      />
      <CommunitiesSection />
    </div>
  )
}
