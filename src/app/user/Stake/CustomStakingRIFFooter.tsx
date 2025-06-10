import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { goToExplorerWithTxHash } from '@/lib/utils'

interface CustomStakingRIFFooterProps {
  hash?: string
  isAllowanceNeeded: boolean
  isAllowanceTxPending?: boolean
  isAllowanceReadLoading?: boolean
  isAllowanceTxFailed?: boolean
}
/**
 * We will have this component to render info to the user in case they are lacking a validation
 * This will let the user know if they need to request allowance
 * This will also let the user know that their allowance TX is in process
 * @constructor
 */
export function CustomStakingRIFFooter({
  hash,
  isAllowanceNeeded = false,
  isAllowanceTxPending = false,
  isAllowanceReadLoading = false,
  isAllowanceTxFailed = false,
}: CustomStakingRIFFooterProps) {
  if (isAllowanceReadLoading) {
    return (
      <div className="flex justify-center">
        <Paragraph variant="semibold" className="text-sm">
          Fetching current allowance...
        </Paragraph>
      </div>
    )
  }
  if (isAllowanceNeeded && isAllowanceTxPending && !!hash) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <Paragraph variant="semibold" className="text-sm">
          Allowance TX is in process.
        </Paragraph>
        <Paragraph variant="semibold" className="text-sm">
          Wait for Allowance TX to be completed.
        </Paragraph>
        <Button onClick={() => goToExplorerWithTxHash(hash)} buttonProps={{ 'data-testid': 'GoToExplorer' }}>
          Click here to go to the explorer
        </Button>
      </div>
    )
  }
  if (isAllowanceTxFailed && !isAllowanceTxPending && !!hash) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <Paragraph variant="semibold" className="text-sm text-st-error">
          Allowance TX failed.
        </Paragraph>
        <Paragraph variant="semibold" className="text-sm">
          Please try again. If the issue persists, contact support for assistance.
        </Paragraph>
        <Button onClick={() => goToExplorerWithTxHash(hash)} buttonProps={{ 'data-testid': 'GoToExplorer' }}>
          Click here to go to the explorer
        </Button>
      </div>
    )
  }

  return null
}
