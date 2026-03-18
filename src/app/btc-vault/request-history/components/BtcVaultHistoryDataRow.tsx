'use client'

import { memo, useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

import type { BtcVaultHistoryTable } from './BtcVaultHistoryTable.config'
import { ActionsCell, AmountCell, DateCell, StatusCell, TypeCell } from './Cells'

interface Props {
  row: BtcVaultHistoryTable['Row']
}

export const BtcVaultHistoryDataRow = memo(({ row }: Props) => {
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
      data-testid="btc-vault-history-data-row"
    >
      <TypeCell type={data.type} isHovered={isHovered} />
      <DateCell date={data.date} isHovered={isHovered} />
      <AmountCell
        amount={data.amount}
        fiatAmount={data.fiatAmount}
        claimTokenType={data.claimTokenType}
        isHovered={isHovered}
      />
      <StatusCell displayStatus={data.status} displayStatusLabel={data.displayStatusLabel} />
      <ActionsCell
        requestId={String(row.id)}
        requestStatus={data.requestStatus}
        type={data.type}
        isHovered={isHovered}
      />
    </tr>
  )
})

BtcVaultHistoryDataRow.displayName = 'BtcVaultHistoryDataRow'
