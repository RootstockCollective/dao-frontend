import { withFeatureFlagRSC } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'

const BackingPageWithFeature = withFeatureFlagRSC(BackingPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
