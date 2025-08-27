'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withFeatureFlag } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'
import { BackingContextProvider } from '../shared/context/BackingContext'

const BackingPageWithContext = () => (
  <CycleContextProvider>
    <BackingContextProvider dynamicAllocations>
      <BackingPage />
    </BackingContextProvider>
  </CycleContextProvider>
)

const BackingPageWithFeature = withFeatureFlag(BackingPageWithContext, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
