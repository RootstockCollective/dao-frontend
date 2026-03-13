import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { FundManagerPage } from './FundManagerPage'

const FundManagerPageWithFeature = withServerFeatureFlag(FundManagerPage, {
  feature: 'btc_vault',
  redirectTo: '/',
})

export default FundManagerPageWithFeature
