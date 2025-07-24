import { withServerFeatureFlag } from '@/shared/context'
import { MyHoldings } from './my-holdings/MyHoldings'
import User from './user/page'

export default withServerFeatureFlag(MyHoldings, {
  feature: 'v3_design',
  fallback: <User />,
})
