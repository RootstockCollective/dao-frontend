'use client'

import { memo, useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

import { ApyCell, DepositWindowCell, EndDateCell, StartDateCell, TvlCell } from './Cells'
import type { DepositHistoryTableType } from './DepositHistoryTable.config'

interface Props {
  row: DepositHistoryTableType['Row']
}

export const DepositHistoryDataRow = memo(({ row }: Props) => {
  const { data } = row
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <tr
      className={cn(
        'flex border-b-v3-bg-accent-60 border-b gap-4 pl-4 py-3 min-h-[65px]',
        isHovered && 'bg-v3-text-100',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="deposit-history-data-row"
    >
      <DepositWindowCell value={data.depositWindow} isHovered={isHovered} />
      <StartDateCell value={data.startDate} isHovered={isHovered} />
      <EndDateCell value={data.endDate} isHovered={isHovered} />
      <TvlCell tvl={data.tvl} fiatTvl={data.fiatTvl} isHovered={isHovered} />
      <ApyCell value={data.apy} isHovered={isHovered} />
    </tr>
  )
})

DepositHistoryDataRow.displayName = 'DepositHistoryDataRow'
