'use client'

import { Expandable, ExpandableContent, ExpandableHeader } from '@/components/Expandable'
import { SmallLineSeparator } from '@/components/Separators/SmallLineSeparator'
import { Paragraph } from '@/components/Typography'
import { Row } from '@/shared/context/TableContext/types'
import { ColumnId, TransactionHistoryCellDataMap } from '../../config'
import { MobileAmountCell, MobileFromToCell, MobileTotalAmountCell, MobileTypeCell } from './MobileCells'
import { MobileGroupedDetails } from './MobileGroupedDetails'

export type TransactionRow = Row<ColumnId, Row['id'], TransactionHistoryCellDataMap>

interface MobileRowProps {
  row: TransactionRow
}

export const MobileRow = ({ row }: MobileRowProps) => {
  const { cycle, date, from_to, type, amount, total_amount } = row.data

  const isGrouped = from_to.isGrouped || false

  return (
    <Expandable className="border-b border-v3-bg-accent-60 gap-0">
      <ExpandableHeader className="py-4" triggerColor="var(--color-bg-0)" toggleOnClick>
        <div className="flex items-center">
          <Paragraph variant="body" bold>
            Cycle {cycle.cycle}
          </Paragraph>
          <SmallLineSeparator />
          <Paragraph variant="body-s">{date.formatted}</Paragraph>
        </div>
      </ExpandableHeader>
      <ExpandableContent contentClassName="my-0">
        <div className="flex flex-col mt-1 mb-4 gap-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 items-start justify-start">
            <MobileFromToCell
              builder={from_to.builder}
              builderAddress={from_to.builderAddress}
              isGrouped={isGrouped}
            />
            <MobileTypeCell type={type.type} />
            <MobileAmountCell amounts={amount.amounts} type={type.type} increased={amount.increased} />
            <MobileTotalAmountCell usd={total_amount.usd} />
          </div>
          {isGrouped && <MobileGroupedDetails row={row} />}
        </div>
      </ExpandableContent>
    </Expandable>
  )
}
