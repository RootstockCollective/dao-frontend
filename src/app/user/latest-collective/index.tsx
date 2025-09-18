import { ButtonAction } from '@/app/proposals/components/vote-details'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Proposal } from '@/app/proposals/shared/types'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { LatestActiveProposalCard, LatestProposalCard } from './components'
import { SpotlightBuildersGrid } from '@/app/shared/components/SpotlightBuildersGrid'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'

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
      <div className="p-6">
        <Header variant="h3">THE LATEST IN THE COLLECTIVE</Header>
        <Header variant="h4" className="mt-10">
          PROPOSALS
        </Header>
        {activeProposal ? (
          <LatestActiveProposalCard
            className="mt-4"
            proposal={activeProposal}
            /**TODO: when votingPower returned as BigInt consume as is */
            votingPower={votingPowerRaw ?? BigInt(0)}
            buttonAction={buttonAction}
          />
        ) : (
          <div className="flex gap-2 mt-4">
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
      <div className="mt-10 pb-6">
        <Header variant="h4" caps className="px-6">
          Builders in the spotlight
        </Header>
        <div className="mt-4 md:px-6 pl-6 pr-0">
          <SpotlightBuildersGrid
            builders={randomBuilders.map(builder => ({
              builder,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
