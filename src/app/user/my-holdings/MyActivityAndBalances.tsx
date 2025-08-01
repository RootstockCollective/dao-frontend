'use client'

import { MyBacking } from './components/backing'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { BalancesSection } from '../Balances/BalancesSection'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'

const Separator = () => <hr className="w-full bg-bg-60 border-none h-px my-10" />

export const MyActivityAndBalances = () => {
  const { address } = useAccount()
  const { data: gauge } = useReadBuilderRegistry(
    {
      functionName: 'builderToGauge',
      args: [address ?? zeroAddress],
    },
    { enabled: !!address },
  )

  const isUserBuilder = Boolean(gauge && gauge !== zeroAddress)
  const sectionTitle = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'

  return (
    <SectionContainer title={sectionTitle} headerVariant="h3">
      <MyBacking />
      <Separator />
      <BalancesSection />
    </SectionContainer>
  )
}
