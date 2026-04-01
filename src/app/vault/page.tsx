import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { VaultPage } from './VaultPage'

const VaultPageWithFeature = withServerFeatureFlag(VaultPage, {
  feature: 'vault',
  redirectTo: '/',
})

export default VaultPageWithFeature
