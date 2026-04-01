'use client'

import { Label, Paragraph } from '@/components/Typography'
import { Suspense } from 'react'
import { MobileRow, TransactionRow } from './MobileRow'
import { useTotalAmount } from '../../hooks/useTotalAmount'

interface Props {
  rows: TransactionRow[]
}

export const MobileTransactionHistory = ({ rows }: Props) => {
  const visibleTotalAmountUsd = useTotalAmount(rows)

  return (
    <div className="w-full md:hidden">
      <Suspense fallback={<div>Loading data...</div>}>
        {rows.length > 0 && (
          <div className="py-4">
            <Label variant="body-xs" className="text-v3-bg-accent-0">
              Total amount (USD)
            </Label>
            <Paragraph>{visibleTotalAmountUsd}</Paragraph>
          </div>
        )}
        {rows.map(row => (
          <MobileRow key={row.id} row={row} />
        ))}
      </Suspense>
    </div>
  )
}
