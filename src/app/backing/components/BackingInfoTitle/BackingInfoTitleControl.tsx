import { useContext } from 'react'
import { useAccount } from 'wagmi'
import { BackingInfoTitle } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitle'
import { useAllocationsContext } from '@/app/context'

export const BackingInfoTitleControl = () => {
  const { isConnected } = useAccount()
  const {
    initialState: { backer },
  } = useAllocationsContext()

  const hasAllocations = backer.amountToAllocate > 0n

  return <BackingInfoTitle hasAllocations={hasAllocations} isConnected={isConnected} />
}
