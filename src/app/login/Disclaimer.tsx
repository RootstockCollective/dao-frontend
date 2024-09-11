import { ConnectButton } from '@/components/Header'
import { Paragraph } from '@/components/Typography'
import { FC } from 'react'

interface Props {
  onAgree: () => void
}

export const Disclaimer: FC<Props> = ({ onAgree }) => (
  <div className="flex flex-col items-center mt-12 ">
    <Paragraph size="large" className="text-center">
      The RootstockCollective has taken actions in order to prevent access to any person located in the
      prohibited jurisdictions, as mentioned in the Terms of Use, including any person located in the United
      States of America. Please note that interaction with the dApp by any person or entity considered a
      resident, or taxpayer in a prohibited jurisdiction, including without limitation the United States of
      America, is forbidden. Please read the terms and conditions carefully before using the
      RootstockCollective dApp.
    </Paragraph>
    <div className="mt-12">
      <ConnectButton onSuccess={onAgree}>Agree</ConnectButton>
    </div>
  </div>
)
