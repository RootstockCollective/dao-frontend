import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'

export const useIsBuilder = () => {
  const { address } = useAccount()
  const { data: gauge } = useReadBuilderRegistry(
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
  }
}
