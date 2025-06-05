import { ExternalLink } from '@/components/Link/ExternalLink'
import { Paragraph, Span } from '@/components/TypographyNew'
import { EXPLORER_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Props {
  txHash?: string
  isTxFailed?: boolean
  failureMessage?: string
  className?: string
}

export const TransactionStatus = ({
  txHash,
  isTxFailed,
  failureMessage = 'Transaction failed.',
  className,
}: Props) => {
  if (!txHash) return null

  return (
    <div className={cn('flex flex-col mb-5', className)}>
      {isTxFailed && (
        <div className="flex items-center gap-2">
          <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
          <Paragraph variant="body" className="text-error">
            {failureMessage}
          </Paragraph>
        </div>
      )}
      <div className={cn({ 'ml-12': isTxFailed })}>
        <ExternalLink href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" variant="menu">
          <Span variant="body-s" bold>
            View transaction in Explorer
          </Span>
        </ExternalLink>
      </div>
    </div>
  )
}
