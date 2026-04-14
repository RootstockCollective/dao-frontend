import { Header, Label } from '@/components/Typography'

import { BOTH_PAUSED_REASON, DEPOSIT_PAUSED_REASON, WITHDRAWAL_PAUSED_REASON } from '../../services/constants'
import type { PauseState } from '../../services/types'

export interface PauseBannerContentProps {
  pauseState: PauseState
}

export function PauseBannerContent({ pauseState }: PauseBannerContentProps) {
  const bothPaused = pauseState.deposits === 'paused' && pauseState.withdrawals === 'paused'
  const message = bothPaused
    ? BOTH_PAUSED_REASON
    : pauseState.deposits === 'paused'
      ? DEPOSIT_PAUSED_REASON
      : WITHDRAWAL_PAUSED_REASON

  return (
    <section data-testid="pause-banner-content" className="flex flex-col gap-2">
      <Header variant="h4" className="text-v3-text-0 font-bold uppercase leading-[130%] tracking-[0.4px]">
        PAUSED
      </Header>
      <Label variant="body-l" className="text-[#171412] leading-[133%] max-w-xl">
        {message}
      </Label>
    </section>
  )
}
