import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { Modal } from '@/components/Modal/Modal'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { currentEnvContracts } from '@/lib/contracts'
import { steps } from './Steps/stepsUtils'
import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'

interface StakingStepsProps {
  onCloseModal: () => void
}

const StakingSteps = ({ onCloseModal }: StakingStepsProps) => {
  const { step, onGoNext, onGoBack } = useSteps()
  const { balances, prices } = useBalancesContext()

  const currentStep = useMemo(() => steps[step], [step])

  const StepComponent = currentStep.stepComponent

  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }

  const tokenToSend: StakingToken = useMemo(
    () => ({
      balance: balances.RIF.balance,
      symbol: balances.RIF.symbol,
      contract: currentEnvContracts.RIF,
      price: prices.RIF.price.toString(),
    }),
    [balances.RIF.balance, balances.RIF.symbol, prices.RIF.price],
  )

  const tokenToReceive: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: currentEnvContracts.stRIF,
      price: prices.stRIF.price.toString(),
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF.price],
  )
  return (
    <StakingProvider
      tokenToSend={tokenToSend}
      tokenToReceive={tokenToReceive}
      actionToUse={useStakeRIF}
      actionName="STAKE"
    >
      <Modal {...currentStep.modalProps} onClose={onCloseModal}>
        <StepComponent {...stepsFunctions} />
      </Modal>
    </StakingProvider>
  )
}

export const StakingModal = () => {
  const { stakeModal } = useBalancesContext()

  if (stakeModal.isModalOpened) {
    return <StakingSteps onCloseModal={stakeModal.closeModal} />
  }

  return null
}
