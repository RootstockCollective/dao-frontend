import { Section } from '@/app/my-rewards/components/Section'
import { PageTitle } from '@/components/PageBanner'

import { BtcVaultHistoryTableWithContext } from './components/BtcVaultHistoryTable'

const PAGE_NAME = 'Transactions History'

export default function BtcVaultRequestHistoryPage() {
  return (
    <div
      data-testid="btc-vault-history-page"
      className="flex flex-col items-start w-full h-full gap-2 rounded-sm"
    >
      <PageTitle className="pb-4 md:pb-10" dataTestId="btc-vault-history-header">
        {PAGE_NAME}
      </PageTitle>
      <Section>
        <BtcVaultHistoryTableWithContext />
      </Section>
    </div>
  )
}
