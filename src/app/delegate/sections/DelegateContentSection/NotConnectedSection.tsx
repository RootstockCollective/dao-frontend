import { DisconnectIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonOrangeComponent } from '@/shared/walletConnection'
import { ComponentProps } from 'react'

export const NotConnectedSection = () => (
  <div className="flex flex-col justify-center items-center py-20 px-6 bg-bg-80">
    <div className="mb-6">
      <DisconnectIcon size={88} fill="#37322F" />
    </div>
    <div className="flex flex-col items-center justify-center">
      <Paragraph bold className="text-text-100 mt-1">
        Your wallet is not connected
      </Paragraph>
      <Paragraph className="text-text-60 text-center mb-6">
        Select a delegate to make governance decisions on your behalf.
      </Paragraph>
      <ConnectWorkflow ConnectComponent={LargerConnectButton} />
    </div>
  </div>
)

const LargerConnectButton = (props: ComponentProps<typeof ConnectButtonOrangeComponent>) => (
  <ConnectButtonOrangeComponent className="py-3 px-4" {...props} />
)
