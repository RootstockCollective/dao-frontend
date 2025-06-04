import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { stakingSteps } from './Steps/stepsUtils'
import { StakingModal } from './StakeModal'

interface StakingStepsProps {
  onCloseModal: () => void
}

export const StakingSteps = ({ onCloseModal }: StakingStepsProps) => {
  const { step, onGoNext, onGoBack } = useSteps(3)
  const { balances, prices } = useBalancesContext()

  const currentStep = useMemo(() => stakingSteps[step], [step])

  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }

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
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive} actionName="STAKE">
      <StakingModal currentStep={currentStep} stepsFunctions={stepsFunctions} onClose={onCloseModal} />
    </StakingProvider>
  )
}
