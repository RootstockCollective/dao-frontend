'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withFeatureFlag } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'
import { RewardsContextProvider } from '../shared/context/RewardsContext/RewardsContext'

const BackingPageWithContext = () => {
  return (
    <CycleContextProvider>
      <RewardsContextProvider dynamicAllocations>
        <BackingPage />
      </RewardsContextProvider>
    </CycleContextProvider>
  )
}

const BackingPageWithFeature = withFeatureFlag(BackingPageWithContext, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
