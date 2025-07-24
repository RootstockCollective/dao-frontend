import { ButtonAction } from '@/app/proposals/components/vote-details'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Proposal } from '@/app/proposals/shared/types'
import { Header } from '@/components/TypographyNew'
import { useRouter } from 'next/navigation'
import { LatestActiveProposalCard, LatestProposalCard } from './components'
import { Spotlight } from '@/app/backing/components/Spotlight'
import { ActionsContainer } from '@/components/containers/ActionsContainer'

interface LatestCollectiveSectionProps {
  latestProposals: Proposal[]
  activeProposal?: Proposal
}

export const LatestCollectiveSection = ({
  latestProposals,
  activeProposal,
}: LatestCollectiveSectionProps) => {
  const router = useRouter()

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
    <div className="bg-bg-80 p-6 mt-2 flex flex-col gap-10">
      <Header variant="h3">THE LATEST IN THE COLLECTIVE</Header>
      <div>
        <Header variant="h4" className="mt-10" caps>
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
      </div>
      {/** @TODO: paste BUILDER SPOTLIGHT HERE */}
      {/* <Header variant="h4" className="mt-10">
        BUILDERS IN THE SPOTLIGHT
      </Header> */}
      <ActionsContainer
        title={
          <Header variant="h4" caps>
            Builders in the spotlight
          </Header>
        }
      >
        <Spotlight />
      </ActionsContainer>
    </div>
  )
}
