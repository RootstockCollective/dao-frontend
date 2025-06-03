import { StepOne } from '@/app/user/Stake/Steps/StepOne'
import { StepTwo } from '@/app/user/Stake/Steps/StepTwo'
import { StepThree } from '@/app/user/Stake/Steps/StepThree'
import { StepAllowance } from '@/app/user/Stake/Steps/StepAllowance'

export const steps = [
  {
    stepComponent: StepOne,
    modalProps: {
      width: 720,
    },
  },
  {
    stepComponent: StepTwo,
    modalProps: {
      width: 720,
    },
  },
  {
    stepComponent: StepThree,
    modalProps: {
      width: 720,
    },
  },
]

export const textsDependingOnAction = {
  STAKE: {
    modalTitle: 'STAKE',
    inputLabel: 'Amount to stake',
    confirmButtonText: 'Continue',
    preview: 'STAKE PREVIEW',
    previewText: 'Preview your stake and make sure everything is correct!',
    inProcess: 'STAKE IN PROCESS',
    description: 'Congratulations and thank you for staking your RIF in the Collective',
    amountError: 'This is more than the available RIF balance. Please update the amount.',
  },
  UNSTAKE: {
    modalTitle: 'UNSTAKE',
    inputLabel: 'Unstake amount',
    confirmButtonText: 'Unstake',
    preview: 'UNSTAKE PREVIEW',
    previewText: 'Preview your unstake and make sure everything is correct!',
    inProcess: 'UNSTAKE IN PROCESS',
    description: 'Your tokens will arrive soon.',
    amountError: 'This is more than the available stRIF balance. Please update the amount.',
  },
}

export const stakingSteps = [
  {
    stepComponent: StepOne,
    modalProps: {
      width: 688,
    },
  },
  {
    stepComponent: StepAllowance,
    modalProps: {
      width: 688,
    },
  },
  {
    stepComponent: StepTwo,
    modalProps: {
      width: 688,
    },
  },
  {
    stepComponent: StepThree,
    modalProps: {
      width: 688,
    },
  },
]

export type ActionBeingExecuted = keyof typeof textsDependingOnAction
