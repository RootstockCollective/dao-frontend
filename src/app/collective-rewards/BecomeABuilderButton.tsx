import { BuilderInfo } from '@/app/collective-rewards/types'
import { useAlertContext } from '@/app/providers/AlertProvider'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { FC, HtmlHTMLAttributes, useEffect } from 'react'
import { Address } from 'viem'
import { BuilderContextProvider, useBuilderContext } from '@/app/collective-rewards/BuilderContext'

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

export const crStatusColorClasses: Record<
  BuilderInfo['status'],
  HtmlHTMLAttributes<HTMLSpanElement>['className']
> = {
  Whitelisted: 'bg-[#DBFEE5] text-secondary',
  'In progress': 'bg-[#4B5CF0] color-text-primary',
} as const

const StatusBadge: FC<StatusBadgeProps> = ({ builderStatus }) => {
  const InProgressComponent = (
    <Badge content="In Progress" className={`${crStatusColorClasses['In progress']} py-2 px-1`} />
  )
  const WhitelistedComponent = (
    <Badge content="You are a Builder" className={`${crStatusColorClasses['Whitelisted']} py-2 px-1`} />
  )

  return {
    'In progress': InProgressComponent,
    Whitelisted: WhitelistedComponent,
    undefined: BuilderRegistrationButton,
  }[builderStatus as BuilderInfo['status']]
}

export const BecomeABuilderHandler = ({ address }: { address: Address }) => {
  const { setMessage: setErrorMessage } = useAlertContext()

  const { getBuilderByAddress, isLoading: builderLoading, error: builderLoadingError } = useBuilderContext()

  const builder = getBuilderByAddress(address)

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

  if (builderLoading) {
    return <LoadingSpinner className={'justify-end w-1/4'} />
  }

  if (!builder) {
    return <BuilderRegistrationButton />
  }

  return <StatusBadge builderStatus={builder.status} />
}

export const BecomeABuilderButton = ({ address }: { address: Address }) => {
  return (
    <BuilderContextProvider>
      <BecomeABuilderHandler address={address} />
    </BuilderContextProvider>
  )
}
