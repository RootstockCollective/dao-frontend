import { ReactNode } from 'react'
import { Popover } from '@/components/Popover'
import { Paragraph } from '@/components/TypographyNew'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponentSecondary } from '@/shared/walletConnection'

export const ConnectPopover = ({ children }: { children: ReactNode }) => (
  // FIXME: conciliate with the new popover component once implemented (ie. remove custom styles)
  <Popover
    content={
      <div className="bg-[#E4E1DA] rounded-sm shadow-sm flex flex-col w-full items-start p-6">
        <Paragraph className="text-[#37322F] text-[14px] font-normal text-left mb-[14px]">
          Connect your wallet and get RIF before backing a Builder
        </Paragraph>
        <ConnectWorkflow ConnectComponent={ConnectButtonComponentSecondary} />
      </div>
    }
    trigger="hover"
    size="medium"
    position="top"
    background="light"
    contentSubContainerClassName="border-none shadow-none p-0"
  >
    <div className="w-full flex flex-col items-start">{children}</div>
  </Popover>
)
