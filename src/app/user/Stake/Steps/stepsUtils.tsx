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
    modalTitle: 'STAKE ',
    inputLabel: 'Amount to stake',
    confirmButtonText: 'Stake',
    preview: 'STAKE PREVIEW',
    previewText: 'Preview your stake and make sure everything is correct!',
    inProcess: 'STAKE IN PROCESS',
    description: 'Congratulations and thank you for staking your RIF in the Collective',
  },
  UNSTAKE: {
    modalTitle: 'UNSTAKE ',
    inputLabel: 'Unstake amount',
    confirmButtonText: 'Unstake',
    preview: 'UNSTAKE PREVIEW',
    previewText: 'Preview your unstake and make sure everything is correct!',
    inProcess: 'UNSTAKE IN PROCESS',
    description: 'Your tokens will arrive soon.',
  },
}

export const stakingSteps = [
  {
    stepComponent: StepOne,
    modalProps: {
      width: 720,
    },
  },
  {
    stepComponent: StepAllowance,
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

export type ActionBeingExecuted = keyof typeof textsDependingOnAction
