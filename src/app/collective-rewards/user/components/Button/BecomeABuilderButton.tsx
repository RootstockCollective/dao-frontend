import { useBuilderContext } from '@/app/collective-rewards/user'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BecomeABuilderModal, openKYC } from '@/components/Modal/BecomeABuilderModal'
import { Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import { Address } from 'viem'
import { Builder, BuilderState } from '@/app/collective-rewards/types'
import { isBuilderDeactivated, isBuilderKycRevoked, useHandleErrors } from '@/app/collective-rewards/utils'
import { Popover } from '@/components/Popover'

type ExtendedBuilderState = BuilderState | 'deactivated' | 'paused'
type StatusBadgeProps = {
  builderState: ExtendedBuilderState
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

export const StatusBadgeSection: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex gap-6 items-center">{children}</div>
)
const StatusBadge: FC<StatusBadgeProps> = ({ builderState }) => {
  const InProgressComponent = (
    <StatusBadgeSection>
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
    </StatusBadgeSection>
  )
  const ActiveComponent = <StatusTypography>You are a Builder</StatusTypography>
  const PausedComponent = <StatusTypography>Paused</StatusTypography>
  const DeactivatedComponent = (
    <StatusBadgeSection>
      <StatusTypography>De-activated</StatusTypography>
      <BuilderRegistrationButton />
    </StatusBadgeSection>
  )

  return {
    inProgress: InProgressComponent,
    active: ActiveComponent,
    paused: PausedComponent,
    deactivated: DeactivatedComponent,
  }[builderState]
}

const getBuilderState = (builder: Builder): ExtendedBuilderState => {
  if (!builder.stateFlags) return 'inProgress'
  if (isBuilderDeactivated(builder) || isBuilderKycRevoked(builder.stateFlags)) return 'deactivated'
  const { paused, activated, communityApproved } = builder.stateFlags
  if (!activated || !communityApproved) return 'inProgress'
  return paused ? 'paused' : 'active'
}

export const BecomeABuilderButton = ({ address }: { address: Address }) => {
  const { getBuilderByAddress, isLoading: builderLoading, error: builderLoadingError } = useBuilderContext()

  const builder = getBuilderByAddress(address)

  useHandleErrors({ error: builderLoadingError, title: `Error loading builder with address ${address}` })

  if (builderLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (!builder) {
    return <BuilderRegistrationButton />
  }

  const builderState = getBuilderState(builder)

  return <StatusBadge builderState={builderState} />
}
