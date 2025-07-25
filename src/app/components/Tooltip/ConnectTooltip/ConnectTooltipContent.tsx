import { CommonComponentProps } from '@/components/commonProps'
import { Paragraph } from '@/components/TypographyNew'
import { ConnectButtonComponentSecondary } from '@/shared/walletConnection'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ReactElement } from 'react'

export const ConnectTooltipContent = ({ children }: CommonComponentProps): ReactElement => (
  <div className="flex flex-col items-start p-6 gap-2 self-stretch rounded-sm bg-v3-text-80 text-shadow-[0_8px_24px_0_rgba(23,20,18,0.14)]">
    <div className="flex flex-col items-start gap-3 w-56">
      <Paragraph className="text-v3-bg-accent-100 font-rootstock-sans text-sm font-normal leading-[145%] not-italic">
        {children}
      </Paragraph>
      <ConnectWorkflow ConnectComponent={ConnectButtonComponentSecondary} />
    </div>
  </div>
)
