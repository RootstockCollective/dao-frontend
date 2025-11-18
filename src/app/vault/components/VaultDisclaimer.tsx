import { DecorativeSquares } from '@/app/backing/components/DecorativeSquares'
import { Header, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '@/components/commonProps'

export const VaultDisclaimer: FC<CommonComponentProps> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-start gap-4 self-stretch p-6 text-v3-text-0 rounded-sm',
        className,
      )}
      style={{
        background: 'linear-gradient(270deg, #7B83CF 0%, #FFE5B4 49.49%, #E3FFEB 100%)',
      }}
      data-testid="VaultDisclaimer"
    >
      <DecorativeSquares className="absolute left-0 top-[-30px] z-20" color="#d2fbf6" />
      <Header variant="h3">SANDBOX NOTICE</Header>
      <div className="flex flex-col gap-3">
        <Paragraph>
          This is a <strong>SANDBOX by RootstockLabs</strong> in order to test out new treasury management
          tooling. This tooling could be used in the future to help manage the Treasury from the DAO in the
          Collective, and/or create additional financial products in the Rootstock ecosystem.
        </Paragraph>
        <Paragraph>
          The Sandbox will operate with <strong>full transparency</strong> showing all business flows through
          all parts of the Engine from deposit all the way through to Yield generating protocol.
        </Paragraph>
        <Paragraph>
          The Sandbox will allow small test deposits of up to <strong>100 USD</strong> to clearly demonstrate
          sandbox business flows. Amounts greater than 100 USD can be deposited in the other part of the
          Sandbox where depositors are invited, whitelisted, and have performed KYB. This will form a friends
          and family section of the Sandbox where any value that is received beyond the deposited capital is
          agreed to be returned to the USD Engine.
        </Paragraph>
      </div>
    </div>
  )
}
