import { useMemo, useState } from 'react'

import { BoostEligibleModal } from '@/app/collective-rewards/abi-boost'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'

import { StepWrapper } from './components/StepWrapper'

interface Props {
  onCloseModal: () => void
}

export const StakingFlow = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()
  // Set once a stake qualifies for the ABI boost: the flow then gives way to the eligibility modal
  const [boostEligibleStake, setBoostEligibleStake] = useState<string | null>(null)

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

  if (boostEligibleStake !== null) {
    return <BoostEligibleModal stakedAmount={boostEligibleStake} onClose={onCloseModal} />
  }

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <StepWrapper onCloseModal={onCloseModal} onBoostEligible={setBoostEligibleStake} />
    </StakingProvider>
  )
}
