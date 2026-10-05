import { useRouter } from 'next/navigation'

import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'

export interface StakeRifAction {
  text: string
  onClick: () => void
}

/**
 * The step that gets an account stRIF: stake the RIF it holds, or get some RIF first.
 * `action` is undefined when there is no RIF to stake and no place to get it from (regtest).
 */
export const useStakeRifAction = () => {
  const router = useRouter()
  const { balances, isBalancesLoading } = useBalancesContext()

  const hasRifBalance = Number(balances[RIF]?.balance ?? 0) > 0

  let action: StakeRifAction | undefined
  if (hasRifBalance) {
    action = { text: 'Stake RIF', onClick: () => router.push('/user?action=stake') }
  } else if (currentLinks.getRif) {
    action = {
      text: 'Get RIF',
      onClick: () => window.open(currentLinks.getRif, '_blank', 'noopener,noreferrer'),
    }
  }

  return { action, isLoading: isBalancesLoading }
}
