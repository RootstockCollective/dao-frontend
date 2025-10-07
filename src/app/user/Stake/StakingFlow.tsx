import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { RIF, STRIF } from '@/lib/tokens'
import { StepWrapper } from './components/StepWrapper'

interface Props {
  onCloseModal: () => void
}

export const StakingFlow = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances[RIF].balance,
      symbol: balances[RIF].symbol,
      contract: tokenContracts[RIF],
      price: prices[RIF]?.price.toString(),
    }),
    [balances, prices],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances[STRIF].balance,
      symbol: balances[STRIF].symbol,
      contract: tokenContracts[STRIF],
      price: prices[STRIF]?.price.toString(),
    }),
    [balances, prices],
  )

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <StepWrapper onCloseModal={onCloseModal} />
    </StakingProvider>
  )
}
