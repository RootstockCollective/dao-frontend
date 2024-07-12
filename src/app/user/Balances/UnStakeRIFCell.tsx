import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'

export const UnStakeRIFCell = () => {
  const { unstakeModal } = useBalancesContext()

  return (
    <p
      onClick={unstakeModal.openModal}
      className="text-link underline cursor-pointer"
      data-testid="UnstakeRIFParagraph"
    >
      Unstake
    </p>
  )
}
