import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { useBackerRewardsContext } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/Button'
import { Collapsible } from '@/components/Collapsible'
import { HistoryIcon } from '@/components/Icons/HistoryIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Switch, SwitchThumb } from '@/components/Switch'
import { Header, Span } from '@/components/Typography'
import { TOKENS } from '@/lib/tokens'

import { BackerABI } from './BackerABI'
import { BackerEstimatedRewards } from './BackerEstimatedRewards'
import { RBI as RewardsBalanceIndex } from './RBI'
import { TotalEarned } from './TotalEarned'
import { UnclaimedRewards } from './UnclaimedRewards'

const Container = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`flex items-start gap-2 self-stretch flex-1 min-w-0 pb-0.5 rounded-lg ${className}`}>
      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

const InnerContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col sm:flex-row md:items-start gap-6 sm:gap-10">{children}</div>
}

export const BackerRewardsMetrics = ({ backer }: { backer: Address }) => {
  let {
    detailedView: { value: isDetailedView, onChange: setIsDetailedView },
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useBackerRewardsContext()
  const router = useRouter()

  useHandleErrors({ error: backerRewardsError, title: 'Error loading backer rewards' })

  return (
    <div className="flex flex-col w-full gap-10" data-testid="backer-rewards">
      <div className="flex justify-between">
        <Header variant="h3" className="m-0 text-v3-text-100" data-testid="backer-rewards-header">
          BACKER REWARDS
        </Header>
        {!backerRewardsLoading && (
          <div className="items-center gap-3 hidden md:flex">
            <Switch checked={isDetailedView} onCheckedChange={() => setIsDetailedView(!isDetailedView)}>
              <SwitchThumb />
            </Switch>
            <Span variant="body-s">Detailed View</Span>
          </div>
        )}
      </div>
      {backerRewardsLoading ? (
        <LoadingSpinner size="large" />
      ) : (
        <Collapsible.Root defaultOpen={false}>
          <div
            className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-2 self-stretch"
            data-testid="backer-rewards-cards-container"
          >
            <Container>
              <UnclaimedRewards />
            </Container>
            <Container>
              <InnerContainer>
                <BackerEstimatedRewards />
                <BackerABI backer={backer} />
              </InnerContainer>
            </Container>
            <Container className={`${isDetailedView ? 'visible' : 'invisible'} hidden md:block`}>
              <InnerContainer>
                <div className="items-center gap-2 w-[70%]">
                  <TotalEarned />
                  <Button
                    variant="transparent"
                    className="font-medium px-0 gap-1 text-sm font-rootstock-sans"
                    onClick={() => router.push(`/my-rewards/tx-history/backer`)}
                  >
                    <HistoryIcon className="size-5" />
                    See Rewards History
                  </Button>
                </div>
                <RewardsBalanceIndex backer={backer} tokens={TOKENS} />
              </InnerContainer>
            </Container>
          </div>
          <Collapsible.Content>
            <Container className="block md:hidden mt-6">
              <InnerContainer>
                <div className="flex flex-col gap-2">
                  <TotalEarned />
                  <Button
                    variant="transparent"
                    className="font-medium px-0 gap-1 text-sm font-rootstock-sans"
                    onClick={() => router.push(`/my-rewards/tx-history/backer`)}
                  >
                    <HistoryIcon className="size-5" />
                    See Rewards History
                  </Button>
                </div>
                <RewardsBalanceIndex backer={backer} tokens={TOKENS} />
              </InnerContainer>
            </Container>
          </Collapsible.Content>
          <Collapsible.Toggle
            className="justify-center my-3 md:hidden"
            iconClassName="size-6 text-background-0 hover:text-background-20"
          />
        </Collapsible.Root>
      )}
    </div>
  )
}
