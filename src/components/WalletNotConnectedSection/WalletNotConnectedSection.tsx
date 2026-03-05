'use client'

import { DisconnectIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ConnectButtonOrangeComponent } from '@/shared/walletConnection'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

/**
 * Shared "wallet not connected" block used when the user's wallet is disconnected.
 * Keeps layout and behavior in one place so features don't duplicate the same UI.
 *
 * Used in:
 * - Delegate: DelegateContentSection when wallet is disconnected
 * - BTC Vault: bottom section when wallet is disconnected
 *
 * Update the "Used in" list when adding or removing consumers.
 */
export interface WalletNotConnectedSectionProps {
  title: string
  subtitle: string
  className?: string
  'data-testid'?: string
}

export const WalletNotConnectedSection = ({
  title,
  subtitle,
  className,
  'data-testid': dataTestId,
}: WalletNotConnectedSectionProps) => (
  <div
    className={cn('flex flex-col justify-center items-center py-20 px-6 bg-bg-80', className)}
    data-testid={dataTestId}
  >
    <div className="mb-6">
      <DisconnectIcon size={88} fill="#37322F" />
    </div>
    <div className="flex flex-col items-center justify-center">
      <Paragraph bold className="text-text-100 mt-1">
        {title}
      </Paragraph>
      <Paragraph className="text-text-60 text-center mb-6">{subtitle}</Paragraph>
      <ConnectWorkflow
        ConnectComponent={props => <ConnectButtonOrangeComponent className="py-3 px-4" {...props} />}
      />
    </div>
  </div>
)
