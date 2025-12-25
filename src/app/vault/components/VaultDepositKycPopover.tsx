import { Span } from '@/components/Typography'
import { ExternalLink } from '@/components/Link'
import { VAULT_KYC_URL, USDRIF } from '@/lib/constants'
import { useVaultDepositLimiter } from '../hooks/useVaultDepositLimiter'
import { formatSymbol } from '@/app/shared/formatter'

interface VaultDepositKycPopoverProps {
  className?: string
}

export const VaultDepositKycPopover = ({ className }: VaultDepositKycPopoverProps) => {
  const { maxDefaultDepositLimit } = useVaultDepositLimiter()

  // Format the default limit for display
  const formattedDefaultLimit = formatSymbol(maxDefaultDepositLimit, USDRIF)

  return (
    <div className={className}>
      <Span className="mb-4 text-left text-bg-100">
        You need to complete KYC to deposit more than the limit (Limit {formattedDefaultLimit} USDRIF).{' '}
        <ExternalLink
          href={VAULT_KYC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-v3-primary"
        >
          <Span>Complete KYC</Span>
        </ExternalLink>
      </Span>
    </div>
  )
}
