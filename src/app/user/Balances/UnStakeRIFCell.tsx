import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { cn } from '@/lib/utils'

export const UnStakeRIFCell = () => {
  const { unstakeModal, balances } = useBalancesContext()
  const { balance } = balances['stRIF']
  const hasEnoughBalance = Number(balance) > 0
  return (
    <p
      onClick={hasEnoughBalance ? unstakeModal.openModal : undefined}
      className={cn('underline', hasEnoughBalance ? 'text-link cursor-pointer' : 'text-zinc-500')}
      data-testid="UnstakeRIFParagraph"
    >
      Unstake
    </p>
  )
}
