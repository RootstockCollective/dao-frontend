import { useRouter } from 'next/navigation'

import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'

export interface StakeRifAction {
  text: string
  onClick: () => void
}

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
