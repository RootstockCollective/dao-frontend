import { withServerFeatureFlag } from '@/shared/context'
import { MyHoldings } from './my-holdings/page'

export default withServerFeatureFlag(MyHoldings, {
  feature: 'v3_design',
})
