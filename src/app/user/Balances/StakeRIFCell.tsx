import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'

export const StakeRIFCell = () => {
  const { stakeModal } = useBalancesContext()

  return (
    <p onClick={stakeModal.openModal} className="text-link underline cursor-pointer">
      Stake
    </p>
  )
}
