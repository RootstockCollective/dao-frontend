'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withFeatureFlag } from '@/shared/context/FeatureFlag'

import { BackingContextProvider } from '../shared/context/BackingContext'
import { BackingPage } from './BackingPage'

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
