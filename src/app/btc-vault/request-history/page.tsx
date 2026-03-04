import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { RequestHistoryPage } from './RequestHistoryPage'

const RequestHistoryPageWithFeature = withServerFeatureFlag(RequestHistoryPage, {
  feature: 'btc_vault',
  redirectTo: '/',
})

export default RequestHistoryPageWithFeature
