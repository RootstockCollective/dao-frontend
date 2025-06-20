import { useContext } from 'react'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useAccount } from 'wagmi'
import { BackingInfoTitle } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitle'

export const BackingInfoTitleControl = () => {
  const { isConnected } = useAccount()
  const {
    initialState: { backer },
  } = useContext(AllocationsContext)

  const hasAllocations = backer.amountToAllocate > 0n

  return <BackingInfoTitle hasAllocations={hasAllocations} isConnected={isConnected} />
}
