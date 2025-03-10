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
}

export interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}
