import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { Address, isAddressEqual } from 'viem'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'
import { FC } from 'react'
import { BuilderInfo, invalidProposalStates } from '@/app/bim/types'

type BecomeABuilderButtonProps = {
  address: Address
}

type ProposalNotFoundProps = {
  builder: BuilderInfo
}

const NotFound = () => {
  const modal = useModal()
  return (
    <>
      <Button onClick={modal.openModal}>Become a builder</Button>
      {modal.isModalOpened && <BecomeABuilderModal onClose={modal.closeModal} />}
    </>
  )
}

const ProposalNotFound: FC<ProposalNotFoundProps> = ({ builder }) => {
  const {
    data: proposalsStateMap,
    isLoading: proposalsStateMapLoading,
    error: proposalsStateMapError,
  } = useGetProposalsState(builder.proposals)

  if (proposalsStateMapLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (proposalsStateMapError) return <div>Error loading proposals state.</div>

  const proposal = builder.proposals.find(({ args: { proposalId } }) => {
    const state = proposalsStateMap[proposalId.toString()]

    return !invalidProposalStates.includes(state)
  })

  if (!proposal) {
    return <NotFound />
  }

  // TODO: pending to check the colors and if this badge colors are the same from the whitelist section
  // TODO: check the height and width of the badge
  const InProgressComponent = <Badge status="Waiting for approval" bgColor="bg-[#637381]" />
  const WhitelistedComponent = <Badge status="Whitelisted" bgColor="bg-[#22AD5C]" />

  return {
    'In progress': InProgressComponent,
    Whitelisted: WhitelistedComponent,
  }[builder.status]
}

export const BecomeABuilderButton = ({ address }: BecomeABuilderButtonProps) => {
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useGetBuilders()

  if (buildersLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (buildersError) return <div>Error loading builders.</div>

  const builder = builders.find(builder => isAddressEqual(builder.address as Address, address as Address))

  if (!builder) {
    return <NotFound />
  }

  return <ProposalNotFound builder={builder} />
}
