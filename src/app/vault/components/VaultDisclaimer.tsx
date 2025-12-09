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
          This is a <strong>SANDBOX by RootstockLabs</strong> in order to test out new tooling and is an
          experimental, pre-production testing environment designed to simulate the functionality of a
          potential future yield-bearing vault for USD-denominated crypto assets.
        </Paragraph>
        <Paragraph>
          The <strong>Sandbox Vault prototype</strong> is not a live investment product. It is provided solely
          for testing, feedback, and evaluation purposes. Please see the{' '}
          <a
            href={process.env.NEXT_PUBLIC_VAULT_TERMS_CONDITIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Terms & Conditions here
          </a>
          .
        </Paragraph>
        <Paragraph>
          The Sandbox will allow small test deposits of up to <strong>100 USD</strong> to clearly demonstrate
          sandbox business flows. Amounts greater than 100 USD can be deposited in another part of the Sandbox
          where depositors are invited, whitelisted, and have performed KYC/AML. This will form a friends and
          family section of the Sandbox where any value that is received beyond the deposited capital is
          agreed to be returned during testing.{' '}
          <a
            href={process.env.NEXT_PUBLIC_VAULT_KYC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Click &quot;Talk to the team&quot;
          </a>{' '}
          to register your interest for testing amounts greater than 100 USD.
        </Paragraph>
      </div>
    </div>
  )
}
