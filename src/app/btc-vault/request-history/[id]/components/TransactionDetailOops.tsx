'use client'

import Link from 'next/link'

import { Button } from '@/components/Button'
import { Header, Paragraph } from '@/components/Typography'
import { btcVaultRequestHistory } from '@/shared/constants/routes'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'

type OopsVariant = 'not-connected' | 'not-found'

const VARIANTS: Record<OopsVariant, { title: string; message: string }> = {
  'not-connected': {
    title: 'Wallet Required',
    message: 'Connect your wallet to view request details',
  },
  'not-found': {
    title: 'Not Found',
    message: 'Request not found',
  },
}

interface TransactionDetailOopsProps {
  variant: OopsVariant
}

function ConnectWalletAction() {
  const { onConnectWalletButtonClick } = useAppKitFlow()
  return (
    <Button variant="primary" data-testid="connect-wallet-button" onClick={onConnectWalletButtonClick}>
      Connect Wallet
    </Button>
  )
}

export function TransactionDetailOops({ variant }: TransactionDetailOopsProps) {
  const { title, message } = VARIANTS[variant]

  return (
    <div
      data-testid={`transaction-detail-oops-${variant}`}
      className="flex flex-col items-center justify-center gap-4 py-16"
    >
      <Header variant="h3" className="text-100">
        {title}
      </Header>
      <Paragraph variant="body-l" className="text-bg-0 text-center">
        {message}
      </Paragraph>
      {variant === 'not-connected' && <ConnectWalletAction />}
      {variant === 'not-found' && (
        <Link
          href={btcVaultRequestHistory}
          className="text-primary hover:underline font-bold"
          data-testid="back-to-history-link"
        >
          Back to Request History
        </Link>
      )}
    </div>
  )
}
