'use client'
import { VotingPowerCard } from '@/app/delegate/components/VotingPowerContainer/VotingPowerCard'
import { cn } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { Header } from '@/components/Typography'

interface Props {
  totalProposals: string
  activeProposalsCount?: string
}

export function ProposalsSummary({ totalProposals, activeProposalsCount }: Props) {
  const { isConnected } = useAccount()
  const isDesktop = useIsDesktop()
  return (
    <>
      <div className="p-6 bg-bg-80 my-2">
        <div className="flex flex-col gap-[8px] sm:flex-row">
          <div className={cn('flex', isDesktop ? 'gap-14' : 'gap-4')}>
            {activeProposalsCount && (
              <VotingPowerCard
                title="Active proposals"
                tooltipTitle={'This is the number of proposals you can vote on.'}
                contentValue={
                  !isConnected ? (
                    <div className="flex">
                      {isDesktop ? (
                        <Header variant="h1" className="mr-8">
                          -
                        </Header>
                      ) : (
                        ''
                      )}
                      <ConnectWorkflow />
                    </div>
                  ) : (
                    activeProposalsCount
                  )
                }
              />
            )}
            <VotingPowerCard title="Total proposals" contentValue={totalProposals} />
          </div>
        </div>
      </div>
    </>
  )
}
