import { PendingDistributionStatus } from '@/app/collective-rewards/metrics'
import { Tooltip } from '@/components/Tooltip'

const TOOLTIP_TEXT: Record<PendingDistributionStatus, string> = {
  pending:
    "This Cycle's rewards distribution has not finished yet. The estimate will show once it completes.",
  missed:
    "This Cycle's rewards have not been distributed yet. The estimate will show once the distribution runs.",
}

export const DistributionPending = ({ status }: { status: PendingDistributionStatus }) => (
  <Tooltip text={TOOLTIP_TEXT[status]} side="top">
    <span className="underline decoration-dotted underline-offset-4" data-testid="DistributionPending">
      Distribution pending
    </span>
  </Tooltip>
)
