import { SwapStepProps } from '../types'
import { SwapStepOne } from './SwapStepOne'
import { SwapStepThree } from './SwapStepThree'
import { SwapStepTwo } from './SwapStepTwo'

interface StepConfig {
  component: React.ComponentType<SwapStepProps>
  description: string
  progress: number
}

export const swapStepConfig: StepConfig[] = [
  {
    component: SwapStepOne,
    description: '',
    progress: 28,
  },
  {
    component: SwapStepTwo,
    description: 'Before you can swap, you must first approve the allowance in your wallet.',
    progress: 68,
  },
  {
    component: SwapStepThree,
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]
