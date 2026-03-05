import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'

import { TransactionDetailPage } from './TransactionDetailPage'

interface PageProps {
  params: Promise<{ id: string }>
}

async function TransactionDetailRoute({ params }: PageProps) {
  const { id } = await params
  return <TransactionDetailPage id={id} />
}

const TransactionDetailPageWithFeature = withServerFeatureFlag(TransactionDetailRoute, {
  feature: 'btc_vault',
  redirectTo: '/',
})

export default TransactionDetailPageWithFeature
