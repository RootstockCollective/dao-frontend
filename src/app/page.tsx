import { withServerFeatureFlag } from '@/shared/context'
import { MyHoldings } from './user/page'

export default withServerFeatureFlag(MyHoldings, {
  feature: 'v3_design',
})
