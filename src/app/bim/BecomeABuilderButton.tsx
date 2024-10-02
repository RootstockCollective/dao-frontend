import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { Address, isAddressEqual } from 'viem'

interface BecomeABuilderButtonProps {
  address: string | undefined
}

export const BecomeABuilderButton = ({ address }: BecomeABuilderButtonProps) => {
  const { data, isLoading, error } = useGetBuilders()
  const modal = useModal()

  // TODO: check the height and width of the badge
  const InProgressComponent = <Badge status="Waiting for approval" bgColor="bg-[#637381]" />
  const WhitelistedComponent = <Badge status="Whitelisted" bgColor="bg-[#22AD5C]" />
  const NotFoundComponent = <Button onClick={modal.openModal}>Become a builder</Button>

  const builder = data.find(builder => isAddressEqual(builder.address as Address, address as Address))
  const builderStatus = builder?.status ?? 'Not found'
  //TODO: pending to check the colors and if this badge colors are the same from the whitelist section
  const component = {
    'In progress': InProgressComponent,
    Whitelisted: WhitelistedComponent,
    'Not found': NotFoundComponent,
  }[builderStatus]

  return (
    <>
      {error && <div>Error while loading data, please try again.</div>}
      {isLoading && <LoadingSpinner className={'justify-end w-1/4'} />}
      {!isLoading && component}
      {modal.isModalOpened && (
        <BecomeABuilderModal onClose={modal.closeModal} builderStatus={builderStatus} />
      )}
    </>
  )
}
