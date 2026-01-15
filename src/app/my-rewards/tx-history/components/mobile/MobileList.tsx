'use client'

import { Label, Paragraph } from '@/components/Typography'
import { Suspense } from 'react'
import { MobileRow, TransactionRow } from './MobileRow'
import { useTotalAmount } from '../../hooks/useTotalAmount'

interface MobileListProps {
  rows: TransactionRow[]
}

export const MobileList = ({ rows }: MobileListProps) => {
  const visibleTotalAmountUsd = useTotalAmount(rows)

  return (
    <div className="w-full md:hidden">
      <Suspense fallback={<div>Loading data...</div>}>
        <div className="py-4 gap-5">
          <Label variant="body-xs" className="text-v3-bg-accent-0">
            Total amount (USD)
          </Label>
          <Paragraph>{visibleTotalAmountUsd}</Paragraph>
        </div>
        {rows.map(row => (
          <MobileRow key={row.id} row={row} />
        ))}
      </Suspense>
    </div>
  )
}
