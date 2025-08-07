import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { BuildersPage } from './BuildersPage'

const BackingPageWithFeature = withServerFeatureFlag(BuildersPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default BackingPageWithFeature
