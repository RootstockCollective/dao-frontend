'use client'

import { useEffect, useState } from 'react'

import { Countdown } from '@/components/Countdown/Countdown'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Header, Label } from '@/components/Typography'
import Big from '@/lib/big'

import { useEpochState } from '../hooks/useEpochState'

const DEPOSIT_WINDOW_SUBTITLE = 'For the current cycle, deposits can be made until'

/** Re-render interval (ms) so the countdown display updates. */
const COUNTDOWN_TICK_MS = 60_000

/**
 * Banner shown when the epoch is open and accepting requests. Displays the current deposit window
 * number, the closing date, and a live countdown until the epoch closes. Only rendered when
 * isAcceptingRequests and endTime are present (caller ensures connected + eligible).
 */
export function DepositWindowBanner() {
  const { data: epoch } = useEpochState()
  const [, setTick] = useState(0)

  // Force re-render periodically so Countdown (which uses Date.now() on render) updates.
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), COUNTDOWN_TICK_MS)
    return () => clearInterval(id)
  }, [])

  if (!epoch?.isAcceptingRequests || epoch?.endTime == null) {
    return null
  }

  return (
    <StackableBanner testId="DepositWindowBanner">
      <div className="flex w-full flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Header variant="h3" className="text-v3-text-0 uppercase leading-[130%] tracking-[0.4px]">
            DEPOSIT WINDOW {epoch.epochId}
          </Header>
          <Label variant="body-l" className="text-v3-text-0 leading-[133%]">
            {DEPOSIT_WINDOW_SUBTITLE} {epoch.closesAtFormatted}.
          </Label>
        </div>
        <Countdown
          end={Big(epoch.endTime)}
          timeSource="timestamp"
          className="text-v3-text-100 font-kk-topo font-normal text-[32px] leading-[125%]"
        />
      </div>
    </StackableBanner>
  )
}
