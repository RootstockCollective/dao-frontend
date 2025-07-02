import { DisconnectIcon } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonOrangeComponent } from '@/shared/walletConnection'

export const NotConnectedSection = () => (
  <div className="flex flex-col justify-center items-center py-[80px] px-[24px] bg-bg-80">
    <div className="mb-[24px]">
      <DisconnectIcon size={88} fill="#37322F" />
    </div>
    <div className="flex flex-col items-center justify-center">
      <Paragraph bold className="text-text-100 mt-[4px]">
        Your wallet is not connected
      </Paragraph>
      <Paragraph className="text-text-60 mb-[24px]">
        You need to connect your wallet in order to delegate.
      </Paragraph>
      <ConnectWorkflow ConnectComponent={ConnectButtonOrangeComponent} />
    </div>
  </div>
)
