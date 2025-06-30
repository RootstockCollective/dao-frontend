import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { MyRewardsPage } from './MyRewardsPage'

const MyRewardsPageWithFeature = withServerFeatureFlag(MyRewardsPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

export default MyRewardsPageWithFeature
