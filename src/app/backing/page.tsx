import { withFeatureFlagRSC } from '@/shared/context/FeatureFlag/withFeatureFlagRSC'
import { BackingPage } from './BackingPage'

export default function Backing() {
  return withFeatureFlagRSC({
    feature: 'v3_design',
    children: <BackingPage />,
  })
}
