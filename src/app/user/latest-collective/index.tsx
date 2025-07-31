import { ButtonAction } from '@/app/proposals/components/vote-details'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Proposal } from '@/app/proposals/shared/types'
import { Header } from '@/components/TypographyNew'
import { useRouter } from 'next/navigation'
import { LatestActiveProposalCard, LatestProposalCard } from './components'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { useBuilderContext } from '@/app/context/builder/BuilderContext'
import { BuildersSpotlight } from '@/app/components'

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
    <div className="bg-bg-80 p-6 mt-2">
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
          {latestProposals.map(p => (
            <LatestProposalCard key={p.proposalId} proposal={p} />
          ))}
        </div>
      )}
      <ActionsContainer
        title={
          <Header variant="h4" caps>
            Builders in the spotlight
          </Header>
        }
        className="mt-10 p-0 gap-4"
      >
        <BuildersSpotlight builders={randomBuilders} />
      </ActionsContainer>
    </div>
  )
}
