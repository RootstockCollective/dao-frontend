'use client'

import { CloseIconKoto } from '@/components/Icons/CloseIconKoto'
import { Paragraph } from '@/components/Typography'
import { TransactionRow } from './MobileRow'
import { MobileCellWrapper } from './MobileCells'
import { Expandable, ExpandableContent } from '@/components/Expandable'
import { useExpandableContext } from '@/components/Expandable/ExpandableContext'
import { AmountDisplay, BuilderAvatar, UsdValue } from '..'
import { GroupedTransactionDetail } from '../../config'
import { TransactionHistoryType } from '../../utils/types'

interface Props {
  row: TransactionRow
}

export const MobileGroupedDetails = ({ row }: Props) => {
  const { from_to, type } = row.data
  const groupedDetails = from_to.groupedDetails || []

  if (!from_to.isGrouped || groupedDetails.length === 0) return null

  return (
    <Expandable className="gap-4">
      <ExpandableContent className="flex flex-col">
        {groupedDetails.map(detail => (
          <MobileGroupedDetailItem key={detail.id} detail={detail} type={type.type} />
        ))}
      </ExpandableContent>
      <MobileShowDetailsToggle />
    </Expandable>
  )
}

const MobileShowDetailsToggle = () => {
  const { isExpanded, toggleExpanded } = useExpandableContext()

  return (
    <button onClick={toggleExpanded} className="flex items-center justify-center gap-1 cursor-pointer">
      {isExpanded ? (
        <>
          <Paragraph variant="body-s">Close details</Paragraph>
          <CloseIconKoto size={20} color="var(--background-0)" />
        </>
      ) : (
        <>
          <Paragraph variant="body-s">Show details</Paragraph>
          <span className="text-xl tracking-widest align-middle text-v3-bg-accent-0">···</span>
        </>
      )}
    </button>
  )
}

interface MobileGroupedDetailItemProps {
  detail: GroupedTransactionDetail
  type: TransactionHistoryType
}

const MobileGroupedDetailItem = ({ detail, type }: MobileGroupedDetailItemProps) => {
  const { builder, builderAddress, amounts, usdValue, increased } = detail

  return (
    <div className="bg-v3-bg-accent-100 py-4 px-2">
      <div className="flex flex-col gap-4 items-stretch">
        <MobileCellWrapper label="From/To">
          <BuilderAvatar builder={builder} builderAddress={builderAddress} variant="mobile" />
        </MobileCellWrapper>

        <div className="grid grid-cols-2 gap-x-1 items-start">
          <MobileCellWrapper label="Amount">
            <AmountDisplay amounts={amounts} type={type} increased={increased} variant="mobile" />
          </MobileCellWrapper>

          <MobileCellWrapper label="Total (USD)">
            <UsdValue usd={usdValue} variant="mobile" />
          </MobileCellWrapper>
        </div>
      </div>
    </div>
  )
}
