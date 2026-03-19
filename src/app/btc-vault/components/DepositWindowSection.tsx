'use client'

import { useEffect, useState } from 'react'

import { Countdown } from '@/components/Countdown/Countdown'
import { Header, Label } from '@/components/Typography'
import Big from '@/lib/big'

import type { EpochDisplay } from '../services/ui/types'

const DEPOSIT_WINDOW_SUBTITLE = 'For the current cycle, deposits can be made until'

/** Re-render interval (ms) so the countdown display updates. */
const COUNTDOWN_TICK_MS = 60_000

export interface DepositWindowSectionProps {
  epoch: EpochDisplay
}

/**
 * Inner content for the deposit window: header, subtitle, and countdown.
 * Caller is responsible for epoch availability; when used in a card, wrap with divide-y or section spacing.
 * Includes a periodic re-render so Countdown (which uses Date.now() on render) stays up to date.
 */
export function DepositWindowSection({ epoch }: DepositWindowSectionProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), COUNTDOWN_TICK_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      data-testid="deposit-window-section"
      className="flex w-full flex-row items-center justify-between gap-4"
    >
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
  )
}
