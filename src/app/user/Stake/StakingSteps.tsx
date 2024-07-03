import { useMemo } from 'react'
import { StakingProvider } from '@/app/user/Stake/StakingContext'
import { useSteps } from '@/app/user/Stake/hooks/useSteps'
import { Modal } from '@/components/Modal/Modal'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StepOne, StepTwo, StepThree } from '@/app/user/Stake/Steps'

const steps = [
  {
    stepComponent: StepOne,
    modalProps: {
      width: 720,
      onClose: () => console.log('Close clicked')
    },
  },
  {
    stepComponent: StepTwo,
    modalProps: {
      width: 720,
      onClose: () => console.log('Second step closed')
    },
  },
  {
    stepComponent: StepThree,
    modalProps: {
      width: 720,
      onClose: () => console.log('Third step closed')
    },
  }

]

interface StakingStepsProps {
  onCloseModal: () => void
}

const StakingSteps = ({ onCloseModal }: StakingStepsProps) => {
  const { step, onGoNext, onGoBack } = useSteps()
  
  const currentStep = useMemo(() => steps[step], [step])
  
  const StepComponent = currentStep.stepComponent
  
  const stepsFunctions = { onGoNext, onGoBack, onCloseModal }
  return (
    <StakingProvider>
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
