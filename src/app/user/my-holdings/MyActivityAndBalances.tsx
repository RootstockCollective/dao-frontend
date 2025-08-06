'use client'

import { MyBacking } from './components/backing'
import { SectionContainer, SectionContainerWithSpinner } from '@/app/communities/components/SectionContainer'
import { BalancesSection } from '../Balances/BalancesSection'
import { useIsBuilder } from './hooks/useIsBuilder'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const Separator = () => <hr className="w-full bg-bg-60 border-none h-px my-10" />

export const MyActivityAndBalances = () => {
  const { isUserBuilder, isLoading, error } = useIsBuilder()
  const sectionTitle = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'

  useHandleErrors({ error, title: 'Error fetching builder status' })

  return (
    <SectionContainerWithSpinner title={sectionTitle} headerVariant="h3" isLoading={isLoading}>
      <MyBacking />
      <Separator />
      <BalancesSection />
    </SectionContainerWithSpinner>
  )
}
