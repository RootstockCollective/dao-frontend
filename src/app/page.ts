import { withServerFeatureFlag } from '@/shared/context'
import User from './user/page'

export default withServerFeatureFlag(User, {
  feature: 'v3_design',
})
