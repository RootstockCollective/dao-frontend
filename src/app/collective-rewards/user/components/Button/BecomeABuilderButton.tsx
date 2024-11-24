import { BuilderContextProvider, useBuilderContext } from '@/app/collective-rewards/user'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { Typography } from '@/components/Typography'
import { FC } from 'react'
import { Address } from 'viem'
import { BuilderState, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useHandleErrors } from '@/app/collective-rewards/utils'

type StatusBadgeProps = {
  builderState?: BuilderState
}

const BuilderRegistrationButton = () => {
  const modal = useModal()
  return (
    <>
      <Button onClick={modal.openModal}>Become a builder</Button>
      {modal.isModalOpened && <BecomeABuilderModal onClose={modal.closeModal} />}
    </>
  )
}

const StatusBadge: FC<StatusBadgeProps> = ({ builderState }) => {
  const InProgressComponent = (
    <Badge content="In Progress" className="bg-[#4B5CF0] color-text-primary py-2 px-1" />
  )
  const WhitelistedComponent = (
    <Typography tagVariant="h2" className={'font-kk-topo text-2xl/7 font-normal uppercase py-2 px-1'}>
      You are a Builder
    </Typography>
  )

  return {
    inProgress: InProgressComponent,
    active: WhitelistedComponent,
    undefined: BuilderRegistrationButton,
  }[builderState as BuilderState]
}

const getBuilderState = (builderStateFlags?: BuilderStateFlags): BuilderState => {
  if (!builderStateFlags) return 'inProgress'
  const { activated, communityApproved } = builderStateFlags
  return activated && communityApproved ? 'active' : 'inProgress'
}

export const BecomeABuilderButton = ({ address }: { address: Address }) => {
  const { getBuilderByAddress, isLoading: builderLoading, error: builderLoadingError } = useBuilderContext()

  const builder = getBuilderByAddress(address)
  const builderState = getBuilderState(builder?.stateFlags)

  useHandleErrors({ error: builderLoadingError, title: `Error loading builder with address ${address}` })

  if (builderLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (!builder) {
    return <BuilderRegistrationButton />
  }

  return <StatusBadge builderState={builderState} />
}
