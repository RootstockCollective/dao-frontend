import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { cn } from '@/lib/utils'

export const StakeRIFCell = () => {
  const { stakeModal, balances } = useBalancesContext()
  const { balance } = balances['RIF']
  const hasEnoughBalance = Number(balance) > 0
  return (
    <p
      onClick={hasEnoughBalance ? stakeModal.openModal : undefined}
      className={cn('underline', hasEnoughBalance ? 'text-link cursor-pointer' : 'text-zinc-500')}
      data-testid={'StakeRIFParagraph'}
    >
      Stake
    </p>
  )
}
