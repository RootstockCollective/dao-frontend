import { BuilderContextProvider, useBuilderContext } from '@/app/collective-rewards/user'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BecomeABuilderModal, openKYC } from '@/components/Modal/BecomeABuilderModal'
import { Typography } from '@/components/Typography'
import { FC } from 'react'
import { Address } from 'viem'
import { BuilderState, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Popover } from '@/components/Popover'

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

const StatusTypography = ({ children }: { children: React.ReactNode }) => (
  <Typography tagVariant="h2" className={'font-kk-topo text-2xl/7 font-normal uppercase py-2 px-1'}>
    {children}
  </Typography>
)

const StatusBadge: FC<StatusBadgeProps> = ({ builderState }) => {
  const InProgressComponent = (
    <div className="flex gap-6 items-center">
      <StatusTypography>In Progress</StatusTypography>
      <Popover
        content={
          <div className="text-[12px] font-bold mb-1">
            <p data-testid="inProgressBuilderTooltip">
              No need to fill again if already submitted - review is ongoing.
            </p>
          </div>
        }
        size="small"
        trigger="hover"
      >
        <Button onClick={openKYC}>Submit KYC</Button>
      </Popover>
    </div>
  )
  const ActiveComponent = <StatusTypography>You are a Builder</StatusTypography>

  return {
    inProgress: InProgressComponent,
    active: ActiveComponent,
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
