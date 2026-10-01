import { Section } from '@/app/my-rewards/components/Section'
import { StakingHistoryTableWithContext } from '@/app/staking-history/components/StakingHistoryTable'
import { PageTitle } from '@/components/PageBanner'

const NAME = 'Staking History'

export default function StakingPage() {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <PageTitle className="pb-4 md:pb-[2.5rem]" data-testid="StakingHistoryHeader">
        {NAME}
      </PageTitle>
      <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
        <Section>
          <StakingHistoryTableWithContext />
        </Section>
      </div>
    </div>
  )
}
