'use client'
import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
import { MyRewardsPage } from './MyRewardsPage'
import { BuilderSettingsProvider } from '../collective-rewards/settings/builder/context'

const MyRewardsPageWithFeature = withServerFeatureFlag(MyRewardsPage, {
  feature: 'v3_design',
  redirectTo: '/',
})

const MyRewardsPageWithProviders = () => {
  return (
    <BuilderSettingsProvider>
      <MyRewardsPageWithFeature />
    </BuilderSettingsProvider>
  )
}

export default MyRewardsPageWithProviders
