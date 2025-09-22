import { useContext } from 'react'
import { useAccount } from 'wagmi'
import { BackingInfoTitle } from '@/app/backing/components/BackingInfoTitle/BackingInfoTitle'
import { useBackingContext } from '@/app/shared/context/BackingContext'

export const BackingInfoTitleControl = () => {
  const { isConnected } = useAccount()
  const {
    totalBacking: { pending },
  } = useBackingContext()

  return <BackingInfoTitle hasAllocations={pending > 0n} isConnected={isConnected} />
}
