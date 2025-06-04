import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'

const BackingPageWithContext = () => (
  <CycleContextProvider>
    <BackingPage />
  </CycleContextProvider>
)

const BackingPageWithFeature = withServerFeatureFlag(BackingPageWithContext, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
