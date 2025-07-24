import { useMemo } from 'react'
import { StakingProvider } from '@/app/my-holdings/sections/Stake/StakingContext'
import { useSteps } from '@/app/my-holdings/sections/Stake/hooks/useSteps'
import { useBalancesContext } from '@/app/my-holdings/contexts/BalancesContext'
import { StakingToken } from '@/app/my-holdings/sections/Stake/types'
import { tokenContracts } from '@/lib/contracts'
import { Modal } from '@/components/Modal'
import { StepWrapper } from './components/StepWrapper'
import { stakingSteps } from './Steps/stepsUtils'

interface Props {
  onCloseModal: () => void
}

export const StakingFlow = ({ onCloseModal }: Props) => {
  const { step, ...stepFunctions } = useSteps(stakingSteps.length)
  const { balances, prices } = useBalancesContext()

  const currentStep = useMemo(() => stakingSteps[step], [step])
  const StepComponent = currentStep.component

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
      <Modal width={688} onClose={onCloseModal}>
        <StepWrapper currentStep={step} progress={currentStep.progress} description={currentStep.description}>
          <StepComponent {...stepFunctions} onCloseModal={onCloseModal} />
        </StepWrapper>
      </Modal>
    </StakingProvider>
  )
}
