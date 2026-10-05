'use client'

import { EmptyState } from '@/components/EmptyState'
import { DisconnectIcon } from '@/components/Icons'
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
  <EmptyState
    icon={<DisconnectIcon size={88} fill="#37322F" />}
    title={title}
    subtitle={subtitle}
    action={
      <ConnectWorkflow
        ConnectComponent={props => <ConnectButtonOrangeComponent className="py-3 px-4" {...props} />}
      />
    }
    className={className}
    data-testid={dataTestId}
  />
)
