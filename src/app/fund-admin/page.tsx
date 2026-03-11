import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { AdminPage } from './AdminPage'

const AdminPageWithFeature = withServerFeatureFlag(AdminPage, {
  feature: 'btc_vault',
  redirectTo: '/',
})

export default AdminPageWithFeature
