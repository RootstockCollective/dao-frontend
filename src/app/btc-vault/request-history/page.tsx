import { Section } from '@/app/my-rewards/components/Section'
import { Header } from '@/components/Typography'

import { BtcVaultHistoryTableWithContext } from './components/BtcVaultHistoryTable'

const PAGE_NAME = 'Transactions History'

export default function BtcVaultRequestHistoryPage() {
  return (
    <div
      data-testid={PAGE_NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
    >
      <Header
        caps
        variant="h1"
        className="text-3xl leading-10 pb-4 md:pb-[2.5rem]"
        data-testid="BtcVaultHistoryHeader"
      >
        {PAGE_NAME}
      </Header>
      <Section>
        <BtcVaultHistoryTableWithContext />
      </Section>
    </div>
  )
}
