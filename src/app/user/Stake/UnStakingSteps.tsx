import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { steps } from '@/app/user/Stake/Steps/stepsUtils'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { StakingToken } from '@/app/user/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'
import { StakingModal } from './StakeModal'

interface StakingStepsProps {
  onCloseModal: () => void
}

export const UnStakingSteps = ({ onCloseModal }: StakingStepsProps) => {
  const { step, onGoNext, onGoBack } = useSteps(1)
  const { balances, prices } = useBalancesContext()

  const currentStep = useMemo(() => steps[step], [step])

  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: tokenContracts.stRIF,
      price: prices.stRIF?.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF?.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: tokenContracts.RIF,
      price: prices.RIF?.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF?.price],
  )

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive} actionName="UNSTAKE">
      <StakingModal currentStep={currentStep} stepsFunctions={stepsFunctions} onClose={onCloseModal} />
    </StakingProvider>
  )
}
