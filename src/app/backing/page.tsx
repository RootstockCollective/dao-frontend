'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withFeatureFlag } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'

const BackingPageWithContext = () => (
  <CycleContextProvider>
    <BackingPage />
  </CycleContextProvider>
)

const BackingPageWithFeature = withFeatureFlag(BackingPageWithContext, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
