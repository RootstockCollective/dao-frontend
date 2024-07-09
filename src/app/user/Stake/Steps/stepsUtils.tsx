import { StepOne } from '@/app/user/Stake/Steps/StepOne'
import { StepTwo } from '@/app/user/Stake/Steps/StepTwo'
import { StepThree } from '@/app/user/Stake/Steps/StepThree'

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
    modalTitle: 'Stake ',
    inputLabel: 'Amount to stake',
    confirmButtonText: 'Stake',
    preview: 'Stake preview',
    inProcess: 'Stake in process',
    description: (
      <>
        Congratulations! Real-Time APR rewards will start <br />
        accumulating in your stRIF balance every minute!
      </>
    ),
  },
  UNSTAKE: {
    modalTitle: 'Unstake ',
    inputLabel: 'Amount to unstake',
    confirmButtonText: 'Unstake',
    preview: 'Unstake preview',
    inProcess: 'Unstake in process',
    description: 'Your tokens will arrive soon.',
  },
}

export type ActionBeingExecuted = keyof typeof textsDependingOnAction
