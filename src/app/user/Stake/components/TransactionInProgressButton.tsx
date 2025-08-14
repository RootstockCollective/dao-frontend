import { ProgressButton } from '@/components/ProgressBarNew'
import { Span } from '@/components/Typography'

export const TransactionInProgressButton = () => (
  <ProgressButton className="whitespace-nowrap">
    <Span bold className="text-text-60">
      In progress
    </Span>
  </ProgressButton>
)
