'use client'

import { FundManagerFlowModal } from '../../components/FundManagerFlowModal'
import { UpdateNavProvider } from './UpdateNavContext'
import { UPDATE_NAV_STEP_CONFIG } from './updateNavStepConfig'

interface Props {
  onClose: () => void
}

export const UpdateNavFlow = ({ onClose }: Props) => (
  <UpdateNavProvider>
    <FundManagerFlowModal title="UPDATE NAV" stepConfig={UPDATE_NAV_STEP_CONFIG} onClose={onClose} />
  </UpdateNavProvider>
)
