import { ReactNode } from 'react'
import { Divider } from '@/components/Divider'
import { StepActionButtons } from './StepActionButtons'

interface Button {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface StepLayoutProps {
  children: ReactNode
  primaryButton: Button
  secondaryButton?: Button
  showDivider?: boolean
  isTxPending?: boolean
  isRequesting?: boolean
  additionalContent?: ReactNode
}

export const StepLayout = ({
  children,
  primaryButton,
  secondaryButton,
  showDivider = true,
  isTxPending = false,
  isRequesting = false,
  additionalContent,
}: StepLayoutProps) => (
  <div className="flex flex-col h-full">
    {/* Content area */}
    <div className="flex-1">{children}</div>

    {/* Footer area - always at bottom */}
    <div className="mt-auto">
      {showDivider && <Divider className="mt-8" />}
      <StepActionButtons
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        isTxPending={isTxPending}
        isRequesting={isRequesting}
        additionalContent={additionalContent}
      />
    </div>
  </div>
)
