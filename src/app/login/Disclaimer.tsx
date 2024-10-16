import { Button } from '@/components/Button'
import { ConnectButton } from '@/components/Header'
import { Paragraph } from '@/components/Typography'
import { FC } from 'react'

interface Props {
  onConnect: () => void
  onCancel: () => void
}

export const Disclaimer: FC<Props> = ({ onConnect, onCancel }) => (
  <div className="flex flex-col items-center mt-12 w-3/4">
    <Paragraph size="large" className="font-rootstock-sans">
      The RootstockCollective has taken actions in order to prevent access to any person located in the
      prohibited jurisdictions, as mentioned in the{' '}
      <a
        href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
        target="_blank"
        className="underline cursor-pointer"
      >
        Terms of Use
      </a>
      , including any person located in the United States of America. Please note that interaction with the
      dApp by any person or entity considered a resident, or taxpayer in a prohibited jurisdiction, including
      without limitation the United States of America, is forbidden. Please{' '}
      <a
        href="https://wiki.rootstockcollective.xyz/Terms-of-Use-1041ca6b0b028041a0b1de60e2c16f3c"
        target="_blank"
        className="underline cursor-pointer"
      >
        read the terms and conditions
      </a>
      &nbsp;carefully before using the RootstockCollective dApp.
    </Paragraph>
    <div className="flex mt-12">
      <ConnectButton onSuccess={onConnect} variant="white">
        I Agree
      </ConnectButton>
      <Button onClick={onCancel} variant="outlined" className="ml-5">
        I Disagree
      </Button>
    </div>
  </div>
)
