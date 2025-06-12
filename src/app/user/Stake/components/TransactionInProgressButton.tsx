import { ProgressButton } from '@/components/ProgressBarNew'
import { Span } from '@/components/TypographyNew'

export const TransactionInProgressButton = () => (
  <ProgressButton className="whitespace-nowrap">
    <Span bold className="text-text-60">
      In progress
    </Span>
  </ProgressButton>
)
