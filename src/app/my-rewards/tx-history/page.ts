import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import TransactionHistoryPage from './TransactionHistoryPage'

const TransctionHistoryPageWithFeature = withServerFeatureFlag(TransactionHistoryPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default TransctionHistoryPageWithFeature
