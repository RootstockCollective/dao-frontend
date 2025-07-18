/******************
 * Components Types
 *******************/
import { CommonComponentProps } from '@/components/commonProps'
import { ComponentType, HTMLAttributes } from 'react'

export interface DisclaimerFlowProps {
  onAgree: () => void
  onClose: () => void
}

export interface ConnectButtonComponentProps extends CommonComponentProps<HTMLButtonElement> {
  textClassName?: HTMLAttributes<HTMLSpanElement>['className']
}

export interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}
