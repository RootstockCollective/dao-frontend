import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useReadBuilderRegistry } from '@/shared/hooks/contracts'

export const useIsBuilder = () => {
  const { address } = useAccount()
  const {
    data: gauge,
    isLoading,
    error,
  } = useReadBuilderRegistry(
    {
      functionName: 'builderToGauge',
      args: [address ?? zeroAddress],
    },
    { enabled: !!address },
  )

  const isUserBuilder = Boolean(gauge && gauge !== zeroAddress)

  return {
    isUserBuilder,
    gauge,
    address,
    isLoading,
    error,
  }
}
