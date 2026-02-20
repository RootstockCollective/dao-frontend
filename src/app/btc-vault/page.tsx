import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { BtcVaultPage } from './BtcVaultPage'

const BtcVaultPageWithFeature = withServerFeatureFlag(BtcVaultPage, {
  feature: 'btc_vault',
  redirectTo: '/',
})

export default BtcVaultPageWithFeature
