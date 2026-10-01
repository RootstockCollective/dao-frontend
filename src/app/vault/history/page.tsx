import { Section } from '@/app/my-rewards/components/Section'
import { VaultHistoryTableWithContext } from '@/app/vault/history/components/VaultHistoryTable'
import { PageTitle } from '@/components/PageBanner'

const NAME = 'USD Vault History'

export default function VaultHistoryPage() {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <PageTitle className="pb-4 md:pb-[2.5rem]" data-testid="VaultHistoryHeader">
        {NAME}
      </PageTitle>
      <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
        <Section>
          <VaultHistoryTableWithContext />
        </Section>
      </div>
    </div>
  )
}
