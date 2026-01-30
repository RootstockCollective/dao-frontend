'use client'

import { ReactNode } from 'react'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import { AmountDisplay, BuilderAvatar, MultipleBuildersAvatar, UsdValue } from '..'
import { TransactionHistoryType } from '../../utils/types'
import { TransactionAmount } from '../../config/table.config'
import { Address } from 'viem'

interface MobileCellWrapperProps {
  label: string
  children: ReactNode
  className?: string
}

export const MobileCellWrapper = ({ label, children, className }: MobileCellWrapperProps) => {
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
  builderAddress?: Address
  isGrouped?: boolean
}

export const MobileFromToCell = ({ builder, builderAddress, isGrouped }: MobileFromToCellProps) => {
  if (isGrouped) {
    return (
      <MobileCellWrapper label="From/To">
        <MultipleBuildersAvatar variant="mobile" />
      </MobileCellWrapper>
    )
  }

  return (
    <MobileCellWrapper label="From/To">
      <BuilderAvatar builder={builder} builderAddress={builderAddress} variant="mobile" />
    </MobileCellWrapper>
  )
}

interface MobileTypeCellProps {
  type: TransactionHistoryType
}

export const MobileTypeCell = ({ type }: MobileTypeCellProps) => {
  return (
    <MobileCellWrapper label="Type">
      <Paragraph>{type}</Paragraph>
    </MobileCellWrapper>
  )
}

interface MobileAmountCellProps {
  amounts: TransactionAmount[]
  type: TransactionHistoryType
  increased?: boolean
}

export const MobileAmountCell = ({ amounts, type, increased }: MobileAmountCellProps) => {
  return (
    <MobileCellWrapper label="Amount">
      <AmountDisplay amounts={amounts} type={type} increased={increased} variant="mobile" />
    </MobileCellWrapper>
  )
}

interface MobileTotalAmountCellProps {
  usd: string | string[]
}

export const MobileTotalAmountCell = ({ usd }: MobileTotalAmountCellProps) => {
  return (
    <MobileCellWrapper label="Total amount (USD)">
      <UsdValue usd={usd} variant="mobile" />
    </MobileCellWrapper>
  )
}

interface MobileDateCellProps {
  formatted: string
}

export const MobileDateCell = ({ formatted }: MobileDateCellProps) => {
  return (
    <MobileCellWrapper label="Date">
      <Paragraph variant="body-s">{formatted}</Paragraph>
    </MobileCellWrapper>
  )
}
