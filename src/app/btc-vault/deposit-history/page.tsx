import { Section } from '@/app/my-rewards/components/Section'
import { PageTitle } from '@/components/PageBanner'

import { DepositHistoryTableWithContext } from './components/DepositHistoryTable'

const PAGE_NAME = 'TVL History'

export default function DepositHistoryPage() {
  return (
    <div
      data-testid="deposit-history-page"
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
    >
      <PageTitle className="pb-4 md:pb-10" dataTestId="deposit-history-header">
        {PAGE_NAME}
      </PageTitle>
      <Section>
        <DepositHistoryTableWithContext />
      </Section>
    </div>
  )
}
