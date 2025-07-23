'use client'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { useSearchParams } from 'next/navigation'
import { IntroModal } from './IntroModal'
import { StackingNotifications } from '@/app/user/StackingNotifications/StackingNotifications'
import { useAccount } from 'wagmi'

export default function User() {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  return (
    <div className="flex flex-col gap-2">
      {searchParams.get('action') !== 'stake' && <IntroModal />}
      {isConnected && <StackingNotifications />}
      <BalancesSection />
      <CommunitiesSection />
    </div>
  )
}
