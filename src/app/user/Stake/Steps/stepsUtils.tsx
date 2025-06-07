import { StepOne } from './StepOne'
import { StepThree } from './StepThree'
import { StepTwo } from './StepTwo'

export const textsDependingOnAction = {
  STAKE: {
    inputLabel: 'Amount to stake',
    amountError: 'This is more than the available RIF balance. Please update the amount.',
    buttonText: 'Continue',
  },
  UNSTAKE: {
    inputLabel: 'Unstake amount',
    amountError: 'This is more than the available stRIF balance. Please update the amount.',
    buttonText: 'Unstake',
  },
}

export const stakingSteps = [
  {
    component: StepOne,
    description: '',
    progress: 28,
  },
  {
    component: StepTwo,
    description: 'Before you can stake, you must first approve the allowance in your wallet.',
    progress: 68,
  },
  {
    component: StepThree,
    description: 'Make sure that everything is correct before continuing:',
    progress: 100,
  },
]
