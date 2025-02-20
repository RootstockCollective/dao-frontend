import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/Button'
import { useModal } from '@/shared/hooks/useModal'

export const UnStakeRIFCell = () => {
  const unstakeModal = useModal()
  const { balances } = useBalancesContext()
  const { balance } = balances['stRIF']
  const hasEnoughBalance = Number(balance) > 0
  return (
    <Button
      variant="outlined"
      onClick={unstakeModal.openModal}
      disabled={!hasEnoughBalance}
      buttonProps={{ style: { width: '93px' } }}
      data-testid="UnstakeRIF"
    >
      Unstake
    </Button>
  )
}
