import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { useMemo } from 'react'
import { steps } from '@/app/user/Stake/Steps/stepsUtils'
import { StakingToken } from '@/app/user/Stake/types'
import { currentEnvContracts } from '@/lib/contracts'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { Modal } from '@/components/Modal/Modal'
import { useUnstakeStRIF } from '@/app/user/Stake/hooks/useUnstakeStRIF'

interface StakingStepsProps {
  onCloseModal: () => void
}

const UnStakingSteps = ({ onCloseModal }: StakingStepsProps) => {
  const { step, onGoNext, onGoBack } = useSteps()
  const { balances, prices } = useBalancesContext()

  const currentStep = useMemo(() => steps[step], [step])

  const StepComponent = currentStep.stepComponent

  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: currentEnvContracts.stRIF,
      price: prices.stRIF.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: currentEnvContracts.RIF,
      price: prices.RIF.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF.price],
  )

  return (
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive} actionToUse={useUnstakeStRIF}>
      <Modal {...currentStep.modalProps} onClose={onCloseModal}>
        <StepComponent {...stepsFunctions} />
      </Modal>
    </StakingProvider>
  )
}

export const UnStakingModal = () => {
  const { unstakeModal } = useBalancesContext()

  if (unstakeModal.isModalOpened) {
    return <UnStakingSteps onCloseModal={unstakeModal.closeModal} />
  }

  return null
}
