import { useContext } from 'react'
import { useAccount } from 'wagmi'

import { BackingInfoTitle } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitle'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

export const BackingInfoTitleControl = () => {
  const { isConnected } = useAccount()
  const {
    initialState: { backer },
  } = useContext(AllocationsContext)

  const hasFunds = backer.balance > 0n

  return <BackingInfoTitle hasFunds={hasFunds} isConnected={isConnected} />
}
