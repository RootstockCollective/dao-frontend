import { FlowStepConfig } from '@/app/fund-manager/types'

import { NavInputStep } from './steps/NavInputStep'

export const UPDATE_NAV_STEP_CONFIG: FlowStepConfig[] = [
  {
    component: NavInputStep,
    label: 'Update NAV',
    description: '',
    progress: 100,
  },
]
