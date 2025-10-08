import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { ButtonAction } from '@/app/proposals/components/vote-details'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Proposal } from '@/app/proposals/shared/types'
import { BuilderCardControl } from '@/app/shared/components/BuilderCard'
import { SpotlightBuildersGrid } from '@/app/shared/components/SpotlightBuildersGrid'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { LatestActiveProposalCard, LatestProposalCard } from './components'

interface LatestCollectiveSectionProps {
  latestProposals: Proposal[]
  activeProposal?: Proposal
}

export const LatestCollectiveSection = ({
  latestProposals,
  activeProposal,
}: LatestCollectiveSectionProps) => {
  const router = useRouter()
  const { randomBuilders } = useBuilderContext()

  const { votingPowerRaw } = useVotingPower()
  const buttonAction: ButtonAction = {
    actionName: 'View proposal',
    onButtonClick: () => {
      if (activeProposal) {
        router.push(`/proposals/${activeProposal.proposalId}`)
      }
    },
  }

  return (
    <div className="bg-bg-80 mt-2">
      <div className="flex flex-col p-6 gap-8">
        <Header variant="h3">THE LATEST IN THE COLLECTIVE</Header>
        <div className="flex flex-col gap-4">
          <Header variant="h4">PROPOSALS</Header>
          {activeProposal ? (
            <LatestActiveProposalCard
              proposal={activeProposal}
              /**TODO: when votingPower returned as BigInt consume as is */
              votingPower={votingPowerRaw ?? BigInt(0)}
              buttonAction={buttonAction}
            />
          ) : (
            <div className="flex flex-col md:flex-row gap-2">
              {latestProposals.map((p, index) => (
                <LatestProposalCard
                  key={p.proposalId}
                  proposal={p}
                  data-testid={`LatestProposalCard-${index}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {randomBuilders.length > 0 && (
        <div>
          <Header variant="h4" caps className="px-6">
            Builders in the spotlight
          </Header>
          <div className="mt-4 md:px-6 pl-6 pr-0">
            <SpotlightBuildersGrid>
              {randomBuilders.map((builder, index) => (
                <BuilderCardControl key={builder.address} builder={builder} index={index} />
              ))}
            </SpotlightBuildersGrid>
          </div>
        </div>
      )}
    </div>
  )
}
