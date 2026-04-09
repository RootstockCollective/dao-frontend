/******************
 * Components Types
 *******************/
import { ComponentType, HTMLAttributes } from 'react'

import { CommonComponentProps } from '@/components/commonProps'

export interface DisclaimerFlowProps {
  onAgree: () => void
  onClose: () => void
}

export interface ConnectButtonComponentProps extends CommonComponentProps<HTMLButtonElement> {
  textClassName?: HTMLAttributes<HTMLSpanElement>['className']
  isConnected?: boolean
}

export interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}
