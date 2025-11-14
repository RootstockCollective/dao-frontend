'use client'

import { FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { TransactionHistoryTable } from './TransactionHistoryTable.config'
import { CycleCell, DateCell, FromToCell, TypeCell, AmountCell, TotalAmountCell } from './Cells'

interface TransactionHistoryDataRowProps {
  row: TransactionHistoryTable['Row']
}

export const TransactionHistoryDataRow: FC<TransactionHistoryDataRowProps> = ({ row, ...props }) => {
  const {
    data: { cycle, date, from_to, type, amount, total_amount },
  }: TransactionHistoryTable['Row'] = row

  return (
    <tr {...props} className={cn('flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3')}>
      <CycleCell {...cycle} />
      <DateCell {...date} />
      <FromToCell {...from_to} />
      <TypeCell {...type} />
      <AmountCell {...amount} />
      <TotalAmountCell {...total_amount} />
    </tr>
  )
}
