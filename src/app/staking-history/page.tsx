import { Header } from '@/components/Typography'
import { Section } from '@/app/my-rewards/components/Section'
import StakingHistoryTableContainer from '@/app/staking-history/components/StakingHistoryTableContainer'

const NAME = 'Staking History'

export default function StakingPage() {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header
        caps
        variant="h1"
        className="text-3xl leading-10 pb-[2.5rem]"
        data-testid="StakingHistoryHeader"
      >
        {NAME}
      </Header>
      <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
        <Section>
          <StakingHistoryTableContainer />
        </Section>
      </div>
    </div>
  )
}
