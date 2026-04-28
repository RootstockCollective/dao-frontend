'use client'

import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

import { BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE } from '../constants'

const buttonClassName = 'h-auto min-h-11 w-full shrink-0 py-0.5 px-4 md:min-h-0'

export interface BtcVaultFinalizeSharesBusyButtonProps {
  'data-testid': string
  busyLabel: string
}

/**
 * In-progress vault finalize control: primary styling, no native `disabled` (avoids grey styles),
 * pointer-events on the button so the wrapping tooltip stays the hit target.
 */
export function BtcVaultFinalizeSharesBusyButton({
  'data-testid': dataTestId,
  busyLabel,
}: BtcVaultFinalizeSharesBusyButtonProps) {
  return (
    <ConditionalTooltip
      supportMobileTap
      className="w-full px-5 py-4"
      conditionPairs={[
        {
          condition: () => true,
          lazyContent: () => BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE,
        },
      ]}
    >
      <span className="block w-full cursor-default">
        <Button
          variant="primary"
          className={cn(buttonClassName, 'pointer-events-none')}
          textClassName="text-sm"
          data-testid={dataTestId}
          aria-disabled
          aria-busy
          tabIndex={-1}
        >
          {busyLabel}
        </Button>
      </span>
    </ConditionalTooltip>
  )
}
