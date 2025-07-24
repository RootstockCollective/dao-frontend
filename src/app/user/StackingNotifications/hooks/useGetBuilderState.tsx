import { useReadBuilderRegistry } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistry'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

export const useGetBuilderState = () => {
  const { address } = useAccount()
  const {
    data: builderState,
    isLoading: builderStateLoading,
    error: builderStateError,
  } = useReadBuilderRegistry({
    functionName: 'builderState',
    args: [address ?? zeroAddress],
  })

  const [activated, kycApproved, communityApproved, paused, revoked] = builderState ?? [
    false,
    false,
    false,
    false,
    false,
  ]

  return {
    builderState: { activated, kycApproved, communityApproved, paused, revoked },
    isLoading: builderStateLoading,
    error: builderStateError,
  }
}
