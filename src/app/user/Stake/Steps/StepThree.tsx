import { StakeStatus } from '@/app/user/Stake/StakeStatus'
import { StepProps } from '@/app/user/Stake/types'

export const StepThree = ({ onCloseModal }: StepProps) => {
  // TODO get TX info and render
  return <StakeStatus onReturnToBalances={onCloseModal || (() => {})} />
}
