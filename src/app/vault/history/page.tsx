import { Header } from '@/components/Typography'
import { Section } from '@/app/my-rewards/components/Section'
import { VaultHistoryTableWithContext } from '@/app/vault/history/components/VaultHistoryTable'

const NAME = 'USD Vault History'

export default function VaultHistoryPage() {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header
        caps
        variant="h1"
        className="text-3xl leading-10 pb-4 md:pb-[2.5rem]"
        data-testid="VaultHistoryHeader"
      >
        {NAME}
      </Header>
      <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
        <Section>
          <VaultHistoryTableWithContext />
        </Section>
      </div>
    </div>
  )
}
