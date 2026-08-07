import { Label, Paragraph, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'

import { formatCycleWindow } from '../../utils/dashboardFormatters'
import type { CycleChartPoint } from './CycleBackingChart'

interface CycleBackingTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CycleChartPoint }>
}

export const CycleBackingTooltip = ({ active, payload }: CycleBackingTooltipProps) => {
  const point = payload?.[0]?.payload

  if (!active || !point) return null

  return (
    <div className="bg-v3-bg-accent-100 border border-v3-bg-accent-60 rounded-lg px-4 py-3 flex flex-col gap-1 shadow-xl">
      <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
        Cycle {point.cycleNumber}
      </Label>
      {/*
        Written out in full rather than abbreviated. With the value axis gone this is the only
        place the exact figure appears, and an abbreviation here would leave the chart with no
        precise readout at all.
      */}
      <Paragraph className="text-v3-text-100">
        {formatNumberWithCommas(point.backing)} {STRIF}
      </Paragraph>
      <Span variant="body-xs" className="text-v3-text-40">
        {formatCycleWindow(point.start, point.end)}
      </Span>
    </div>
  )
}
