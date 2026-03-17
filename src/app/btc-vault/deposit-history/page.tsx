import { Section } from '@/app/my-rewards/components/Section'
import { Header } from '@/components/Typography'

import { DepositHistoryTableWithContext } from './components/DepositHistoryTable'

const PAGE_NAME = 'TVL History'

export default function DepositHistoryPage() {
  return (
    <div
      data-testid="deposit-history-page"
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
    >
      <Header
        caps
        variant="h1"
        className="text-3xl leading-10 pb-4 md:pb-[2.5rem]"
        data-testid="deposit-history-header"
      >
        {PAGE_NAME}
      </Header>
      <Section>
        <DepositHistoryTableWithContext />
      </Section>
    </div>
  )
}
