'use client'

import { MyBacking } from './components/backing'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { BalancesSection } from '../Balances/BalancesSection'

const Separator = () => <hr className="w-full bg-bg-60 border-none h-px my-10" />

export const MyActivityAndBalances = () => {
  const isUserBuilder = true // @TODO
  const sectionTitle = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'

  return (
    <SectionContainer title={sectionTitle} headerVariant="h3">
      {isUserBuilder && (
        <>
          <MyBacking />
          <Separator />
        </>
      )}
      <BalancesSection />
    </SectionContainer>
  )
}
