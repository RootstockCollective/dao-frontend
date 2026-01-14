'use client'

import { Label, Paragraph } from '@/components/Typography'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { Suspense, useMemo } from 'react'
import { MobileTransactionDetailRow, TransactionRow } from './MobileTransactionDetailRow'

interface MobileTransactionHistoryProps {
  rows: TransactionRow[]
}

export const MobileTransactionHistory = ({ rows }: MobileTransactionHistoryProps) => {
  const visibleTotalAmountUsd = useMemo(() => {
    if (!rows.length) return ''

    const sanitize = (raw: string | null | undefined) => {
      if (!raw) return 0
      if (raw.startsWith('<')) return 0.0001
      const sanitized = raw.replace(/,/g, '')
      const parsed = Number(sanitized)
      return Number.isNaN(parsed) ? 0 : parsed
    }

    const sum = rows.reduce((acc, row) => {
      const usd = row.data.total_amount.usd
      const values = Array.isArray(usd) ? usd : [usd]
      return acc + values.reduce((subtotal, val) => subtotal + sanitize(val), 0)
    }, 0)

    return formatCurrencyWithLabel(sum, { showCurrencySymbol: false })
  }, [rows])

  return (
    <div className="w-full md:hidden">
      <Suspense fallback={<div>Loading table data...</div>}>
        <div className="py-4 gap-5">
          <Label variant="body-xs" className="text-v3-bg-accent-0">
            Total amount (USD)
          </Label>
          <Paragraph>{visibleTotalAmountUsd}</Paragraph>
        </div>
        {rows.map(row => (
          <MobileTransactionDetailRow key={row.id} row={row} />
        ))}
      </Suspense>
    </div>
  )
}
