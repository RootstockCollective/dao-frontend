'use client'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { SectionContainerWithSpinner } from '@/app/communities/components/SectionContainer'
import { AccentSquare } from '@/components/AccentSquare'

import { BalancesSection } from '../Balances/BalancesSection'
import { MyBacking } from './components/backing'
import { useIsBuilder } from './hooks/useIsBuilder'

const Separator = () => <hr className="w-full bg-bg-60 border-none h-px md:my-10 my-6" />

export const MyActivityAndBalances = () => {
  const { isUserBuilder, isLoading, error } = useIsBuilder()
  const sectionTitle = (
    <span className="flex items-center gap-3">
      <AccentSquare />
      {isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'}
    </span>
  )

  useHandleErrors({ error, title: 'Error fetching builder status' })

  return (
    <SectionContainerWithSpinner title={sectionTitle} headerVariant="h3" isLoading={isLoading}>
      <MyBacking />
      <Separator />
      <BalancesSection />
    </SectionContainerWithSpinner>
  )
}
