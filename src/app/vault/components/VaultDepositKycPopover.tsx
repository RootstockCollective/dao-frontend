import { Span } from '@/components/Typography'
import { ExternalLink } from '@/components/Link'
import { VAULT_KYC_URL } from '@/lib/constants'
import { useVaultDepositValidation } from '../context'

interface VaultDepositKycPopoverProps {
  className?: string
}

export const VaultDepositKycPopover = ({ className }: VaultDepositKycPopoverProps) => {
  const { maxDefaultDepositLimit } = useVaultDepositValidation()

  return (
    <div className={className}>
      <Span className="mb-4 text-left text-bg-100">
        You need to complete KYC to deposit more than the limit (Limit {maxDefaultDepositLimit} USDRIF).{' '}
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
