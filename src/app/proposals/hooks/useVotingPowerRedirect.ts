import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'

export const useVotingPowerRedirect = () => {
  const router = useRouter()
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()

  useEffect(() => {
    if (!isVotingPowerLoading && !canCreateProposal) {
      router.push('/proposals')
    }
  }, [canCreateProposal, isVotingPowerLoading, router])

  return { isVotingPowerLoading, canCreateProposal }
}
