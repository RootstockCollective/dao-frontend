import { Header } from '@/components/TypographyNew'
import { FC, ReactNode, useMemo } from 'react'
import { useBackerRewardsContext } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { UnclaimedRewards } from './UnclaimedRewards'
import { BackerEstimatedRewards } from './BackerEstimatedRewards'
import { BackerABI } from './BackerABI'
import { TotalEarned } from './TotalEarned'
import { RBI } from './RBI'
import { Switch, SwitchThumb } from '@/components/Switch'
import { Typography } from '@/components/TypographyNew/Typography'
import { Address } from 'viem'
import { TOKENS } from '@/lib/tokens'

const Container = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`flex items-start gap-2 self-stretch flex-1 min-w-0 pb-0.5 rounded-lg ${className}`}>
      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

const InnerContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex items-start gap-10">{children}</div>
}

export const BackerRewardsMetrics = ({ backer }: { backer: Address }) => {
  const {
    detailedView: { value: isDetailedView, onChange: setIsDetailedView },
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useBackerRewardsContext()

  return (
    <div className="flex flex-col w-full gap-10" data-testid="backer-rewards">
      <div className="flex justify-between">
        <Header variant="e3" className="m-0 text-v3-text-100" data-testid="backer-rewards-header">
          BACKER REWARDS
        </Header>
        <div className="flex  items-center gap-y-[9px] w-[142px]">
          <Switch checked={isDetailedView} onCheckedChange={() => setIsDetailedView(!isDetailedView)}>
            <SwitchThumb />
          </Switch>
          <Typography tagVariant="label" className="text-xs font-normal font-rootstock-sans">
            Detailed View
          </Typography>
        </div>
      </div>

      <div className="flex items-start gap-2 self-stretch" data-testid="backer-rewards-cards-container">
        <Container>
          <UnclaimedRewards />
        </Container>
        <Container>
          <InnerContainer>
            <BackerEstimatedRewards />
            <BackerABI backer={backer} />
          </InnerContainer>
        </Container>
        <Container className={isDetailedView ? 'visible' : 'invisible'}>
          <InnerContainer>
            <TotalEarned />
            <RBI backer={backer} tokens={TOKENS} />
          </InnerContainer>
        </Container>
      </div>
    </div>
  )
}
