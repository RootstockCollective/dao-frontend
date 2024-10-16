import { useGetBuilderByAddress } from '@/app/bim/hooks/useGetBuilders'
import { BuilderInfo } from '@/app/bim/types'
import { getMostAdvancedProposal } from '@/app/bim/utils/getMostAdvancedProposal'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'
import { useAlertContext } from '@/app/providers/AlertProvider'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { FC, HtmlHTMLAttributes, useEffect } from 'react'
import { Address } from 'viem'

type StatusBadgeProps = {
  builderStatus?: BuilderInfo['status']
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

export const bimStatusColorClasses: Record<
  BuilderInfo['status'],
  HtmlHTMLAttributes<HTMLSpanElement>['className']
> = {
  Whitelisted: 'bg-[#DBFEE5] text-secondary',
  'In progress': 'bg-[#4B5CF0] color-text-primary',
} as const

const StatusBadge: FC<StatusBadgeProps> = ({ builderStatus }) => {
  const InProgressComponent = (
    <Badge content="In Progress" className={`${bimStatusColorClasses['In progress']} py-2 px-1`} />
  )
  const WhitelistedComponent = (
    <Badge content="You are a Builder" className={`${bimStatusColorClasses['Whitelisted']} py-2 px-1`} />
  )

  return {
    'In progress': InProgressComponent,
    Whitelisted: WhitelistedComponent,
    undefined: BuilderRegistrationButton,
  }[builderStatus as BuilderInfo['status']]
}

export const BecomeABuilderButton = ({ address }: { address: Address }) => {
  const { setMessage: setErrorMessage } = useAlertContext()
  const {
    data: builder,
    isLoading: builderLoading,
    error: builderLoadingError,
  } = useGetBuilderByAddress(address)

  const {
    data: builderProposalEvents,
    isLoading: builderProposalEventsLoading,
    error: builderProposalEventsError,
  } = useGetProposalsState(builder?.proposals ?? [])

  useEffect(() => {
    if (builderLoadingError) {
      setErrorMessage({
        severity: 'error',
        title: `Error loading builder with address ${address}`,
        content: builderLoadingError.message,
      })
      console.error('🐛 builderLoadingError:', builderLoadingError)
    }
  }, [builderLoadingError, address, setErrorMessage])

  useEffect(() => {
    if (builderProposalEventsError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading builder proposal events',
        content: builderProposalEventsError.message,
      })
      console.error('🐛 builderProposalEventsError:', builderProposalEventsError)
    }
  }, [builderProposalEventsError, address, setErrorMessage])

  if (builderLoading || builderProposalEventsLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (!builder) {
    return <BuilderRegistrationButton />
  }
  const proposalEvent = getMostAdvancedProposal(builder, builderProposalEvents)

  if (!proposalEvent) {
    return <BuilderRegistrationButton />
  }

  return <StatusBadge builderStatus={builder.status} />
}
