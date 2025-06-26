import { Header, Paragraph } from '@/components/TypographyNew'
import Link from 'next/link'

const MyRewardsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-start gap-3 self-stretch pt-10 pb-10 pl-6 pr-6 bg-v3-bg-accent-80 rounded">
      {children}
    </div>
  )
}

const NAME = 'My Rewards'
export const MyRewardsPage = () => {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>
      <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
        <MyRewardsContainer>
          <Paragraph className="flex items-start flex-1 basis-0">
            Track and claim the rewards you earn from backing Collective Rewards Builders. Claim Rewards and
            restake for higher Rewards and voting power.
          </Paragraph>
          <Paragraph className="flex flex-col items-start gap-2 flex-1 basis-0">
            Learn more about the Collective Rewards in the Whitepaper
            {/* FIXME: Add whitepaper link */}
            <Link href="/whitepaper" target="_blank">
              See the Whitepaper
            </Link>
          </Paragraph>
        </MyRewardsContainer>
        <MyRewardsContainer>
          <Header variant="h3">Builder rewards PLACEHOLDER</Header>
        </MyRewardsContainer>
        <MyRewardsContainer>
          <Header variant="h3">Backer rewards PLACEHOLDER</Header>
        </MyRewardsContainer>
      </div>
    </div>
  )
}
