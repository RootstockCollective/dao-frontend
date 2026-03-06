import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { FundManagerPage } from './FundManagerPage'

const FundManagerPageWithFeature = withServerFeatureFlag(FundManagerPage, {
  feature: 'vault',
  redirectTo: '/',
})

export default FundManagerPageWithFeature
