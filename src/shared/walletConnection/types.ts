/******************
 * Components Types
 *******************/
import { ComponentType } from 'react'

export interface DisclaimerFlowProps {
  onAgree: () => void
  onClose: () => void
}

export interface ConnectButtonComponentProps {
  onClick: () => void
  className?: string
  textClassName?: string
}

export interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}
