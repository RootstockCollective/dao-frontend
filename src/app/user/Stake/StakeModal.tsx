import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { Modal } from '@/components/Modal/Modal'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  currentStep: any
  stepsFunctions: any
  onClose: () => void
}

export const StakingModal = ({ currentStep, stepsFunctions, onClose }: Props) => {
  const { stakeTxHash } = useStakingContext()
  const router = useRouter()

  const handleClose = useCallback(() => {
    onClose()
    if (stakeTxHash) {
      router.push(`/user?txHash=${stakeTxHash}`)
    }
  }, [onClose, stakeTxHash, router])

  const StepComponent = currentStep.stepComponent

  return (
    <Modal {...currentStep.modalProps} onClose={handleClose}>
      <StepComponent {...stepsFunctions} onClose={handleClose} />
    </Modal>
  )
}
