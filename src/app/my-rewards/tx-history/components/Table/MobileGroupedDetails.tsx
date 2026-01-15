'use client'

import { FC } from 'react'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { CloseIconKoto } from '@/components/Icons/CloseIconKoto'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/Typography'
import { cn, shortAddress, truncate } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import Link from 'next/link'
import { Address } from 'viem'
import { TransactionRow } from './MobileTransactionDetailRow'
import { MobileCellWrapper } from './MobileCells'
import { Expandable, ExpandableContent } from '@/components/Expandable'
import { useExpandableContext } from '@/components/Expandable/ExpandableContext'

interface MobileShowDetailsProps {
  row: TransactionRow
}

const MobileShowDetailsTrigger: FC = () => {
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

export const MobileShowDetails: FC<MobileShowDetailsProps> = ({ row }) => {
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
      <MobileShowDetailsTrigger />
    </Expandable>
  )
}

interface MobileGroupedDetailItemProps {
  detail: {
    id: string
    builder?: Builder
    builderAddress?: string
    blockTimestamp: string
    amounts: Array<{ address: string; value: string; symbol: string }>
    usdValue: string | string[]
    increased?: boolean
  }
  type: 'Claim' | 'Back'
}

const MobileGroupedDetailItem: FC<MobileGroupedDetailItemProps> = ({ detail, type }) => {
  const { builder, builderAddress, amounts, usdValue, increased } = detail
  const address = builderAddress ?? ''
  const displayName = builder?.builderName
    ? truncate(builder.builderName, 15)
    : shortAddress(address as Address)

  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined

  return (
    <div className="bg-v3-bg-accent-100 py-4 px-2">
      <div className="flex flex-col gap-4 items-stretch">
        <MobileCellWrapper label="From/To">
          <div className="flex items-center gap-2">
            <Jdenticon className="rounded-full bg-white" value={address} size="24" />
            {builder?.proposal?.id ? (
              <Link href={`/proposals/${builder.proposal.id}`} target="_blank" rel="noopener noreferrer">
                <Paragraph variant="body-s" className="text-v3-primary hover:underline">
                  {displayName}
                </Paragraph>
              </Link>
            ) : (
              <Paragraph variant="body-s" className="text-v3-primary">
                {displayName}
              </Paragraph>
            )}
          </div>
        </MobileCellWrapper>

        <div className="grid grid-cols-2 gap-x-1 items-start">
          <MobileCellWrapper label="Amount">
            <div className="flex flex-col">
              {amounts.map(({ value, symbol }, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Paragraph
                    className={cn(
                      'flex items-center gap-0.5',
                      showArrow ? (increased ? 'text-v3-success' : 'text-error') : 'text-v3-text-100',
                    )}
                  >
                    {showArrow && (
                      <span className="flex items-center">
                        {increased ? (
                          <ArrowUpIcon size={14} color="#1bc47d" />
                        ) : (
                          <ArrowDownIcon size={14} color="#f68" />
                        )}
                      </span>
                    )}
                    {value}
                  </Paragraph>
                  <TokenImage symbol={symbol} size={16} />
                  <Span variant="tag-s">
                    {symbol}
                    {idx < amounts.length - 1 ? ' +' : ''}
                  </Span>
                </div>
              ))}
            </div>
          </MobileCellWrapper>

          <MobileCellWrapper label="Total (USD)">
            <div className="flex flex-col items-start">
              {Array.isArray(usdValue) ? (
                usdValue.map((value, idx) => (
                  <Paragraph key={idx} variant="body-s">
                    {value} USD
                  </Paragraph>
                ))
              ) : (
                <Paragraph variant="body-s">{usdValue} USD</Paragraph>
              )}
            </div>
          </MobileCellWrapper>
        </div>
      </div>
    </div>
  )
}
