import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { BackingPage } from './BackingPage'

const BackingPageWithFeature = withServerFeatureFlag(BackingPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
