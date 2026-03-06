import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { AdminPage } from './AdminPage'

const AdminPageWithFeature = withServerFeatureFlag(AdminPage, {
  feature: 'vault',
  redirectTo: '/',
})

export default AdminPageWithFeature
