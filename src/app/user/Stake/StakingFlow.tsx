import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { StakingToken, TokenWithBalance } from '@/app/user/Stake/types'
import { RIF, STRIF, TOKENS } from '@/lib/tokens'
import { useMemo } from 'react'
import { StepWrapper } from './components/StepWrapper'

interface Props {
  onCloseModal: () => void
}

export const StakingFlow = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()

  const tokenToSend: TokenWithBalance = useMemo(
    () => ({
      balance: balances[RIF]?.balance ?? '0',
      symbol: RIF,
      contract: TOKENS[RIF].address,
      price: prices[RIF]?.price.toString(),
    }),
    [balances, prices],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances[STRIF]?.balance ?? '0',
      symbol: STRIF,
      contract: TOKENS[STRIF].address,
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
