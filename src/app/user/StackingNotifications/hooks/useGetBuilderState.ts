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

  const [initialized, kycApproved, communityApproved, kycPaused, selfPaused] = builderState ?? [
    false,
    false,
    false,
    false,
    false,
  ]

  return {
    builderState: { initialized, kycApproved, communityApproved, kycPaused, selfPaused },
    isLoading: builderStateLoading,
    error: builderStateError,
  }
}
