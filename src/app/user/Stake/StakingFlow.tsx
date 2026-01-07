import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { StepWrapper } from './components/StepWrapper'

interface Props {
  onCloseModal: () => void
}

export const StakingFlow = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: tokenContracts.RIF,
      price: prices.RIF?.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF?.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: tokenContracts.stRIF,
      price: prices.stRIF?.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF?.price],
  )

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <StepWrapper onCloseModal={onCloseModal} />
    </StakingProvider>
  )
}
