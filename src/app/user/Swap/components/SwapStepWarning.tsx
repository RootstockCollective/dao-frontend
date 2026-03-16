import Image from 'next/image'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { LOW_LIQUIDITY_WARNING_MESSAGE } from '../utils/low-liquidity-warning'

interface SwapStepWarningProps {
  message: string
  className?: string
  /** Optional test id for the root element (e.g. swap-low-liquidity-warning). */
  testId?: string
}

/**
 * Shared warning block for the swap flow (icon + message). Single place to update for redesigns.
 * Used for "Select a slippage option to swap" and for the low-liquidity warning.
 */
export function SwapStepWarning({ message, className, testId }: SwapStepWarningProps) {
  return (
    <div
      className={cn('flex items-center gap-2 py-3 bg-st-info/20 rounded-sm', className)}
      data-testid={testId}
    >
      <Image src="/images/warning-icon.svg" alt="Warning" width={24} height={24} />
      <Paragraph variant="body-s" className="text-st-info">
        {message}
      </Paragraph>
    </div>
  )
}

/** Convenience wrapper for the low-liquidity warning message (lose >5% of input). */
export function LowLiquidityWarning({ className }: { className?: string }) {
  return (
    <SwapStepWarning
      message={LOW_LIQUIDITY_WARNING_MESSAGE}
      className={className}
      testId="swap-low-liquidity-warning"
    />
  )
}
