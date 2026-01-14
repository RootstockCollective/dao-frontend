'use client'

import { FC, ReactNode } from 'react'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph, Span } from '@/components/Typography'
import { cn, shortAddress, truncate } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import Link from 'next/link'
import { Address } from 'viem'

interface MobileCellWrapperProps {
  label: string
  children: ReactNode
  className?: string
}

export const MobileCellWrapper: FC<MobileCellWrapperProps> = ({ label, children, className }) => {
  return (
    <div className={cn('flex flex-col gap-1 items-start', className)}>
      <Label variant="body-xs" className="text-v3-bg-accent-0">
        {label}
      </Label>
      {children}
    </div>
  )
}

interface MobileFromToCellProps {
  builder?: Builder
  builderAddress?: string
  isGrouped?: boolean
}

export const MobileFromToCell: FC<MobileFromToCellProps> = ({ builder, builderAddress, isGrouped }) => {
  const address = builderAddress ?? ''
  const displayName = builder?.builderName
    ? truncate(builder.builderName, 15)
    : shortAddress(address as Address)

  if (isGrouped) {
    return (
      <MobileCellWrapper label="From/To">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-v3-rsk-purple w-8 h-8" />
          <Paragraph className="text-v3-primary truncate max-w-[120px]">Multiple Builders</Paragraph>
        </div>
      </MobileCellWrapper>
    )
  }

  return (
    <MobileCellWrapper label="From/To">
      <div className="flex items-center gap-2">
        <Jdenticon className="rounded-full bg-white" value={address} size="32" />
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
  )
}

interface MobileTypeCellProps {
  type: 'Claim' | 'Back'
}

export const MobileTypeCell: FC<MobileTypeCellProps> = ({ type }) => {
  return (
    <MobileCellWrapper label="Type">
      <Paragraph>{type}</Paragraph>
    </MobileCellWrapper>
  )
}

interface MobileAmountCellProps {
  amounts: Array<{ address: string; value: string; symbol: string }>
  type: 'Claim' | 'Back'
  increased?: boolean
}

export const MobileAmountCell: FC<MobileAmountCellProps> = ({ amounts, type, increased }) => {
  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined

  return (
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
  )
}

interface MobileTotalAmountCellProps {
  usd: string | string[]
}

export const MobileTotalAmountCell: FC<MobileTotalAmountCellProps> = ({ usd }) => {
  const isMultipleUsd = Array.isArray(usd)

  return (
    <MobileCellWrapper label="Total amount (USD)">
      <div className="flex flex-col items-start">
        {isMultipleUsd ? (
          usd.map((value, idx) => <Paragraph key={idx}>{value} USD</Paragraph>)
        ) : (
          <Paragraph>{usd} USD</Paragraph>
        )}
      </div>
    </MobileCellWrapper>
  )
}

interface MobileDateCellProps {
  formatted: string
}

export const MobileDateCell: FC<MobileDateCellProps> = ({ formatted }) => {
  return (
    <MobileCellWrapper label="Date">
      <Paragraph variant="body-s">{formatted}</Paragraph>
    </MobileCellWrapper>
  )
}
