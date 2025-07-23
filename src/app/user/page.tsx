'use client'
import { useGetProposalsWithGraph } from '@/app/proposals/hooks/useGetProposalsWithGraph'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { useSearchParams } from 'next/navigation'
import { IntroModal } from './IntroModal'
import { StackingNotifications } from '@/app/user/StackingNotifications/StackingNotifications'
import { useAccount } from 'wagmi'
import { LatestCollectiveSection } from './latest-collective'

export default function User() {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const { activeProposals } = useGetProposalsWithGraph()

  return (
    <div className="flex flex-col gap-2">
      {searchParams.get('action') !== 'stake' && <IntroModal />}
      {isConnected && <StackingNotifications />}
      <BalancesSection />
      {activeProposals.length > 0 && <LatestCollectiveSection proposal={activeProposals[0]} />}
      <CommunitiesSection />
    </div>
  )
}
