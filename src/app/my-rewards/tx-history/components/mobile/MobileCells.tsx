'use client'

import { FC, ReactNode } from 'react'
import { Label, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import { AmountDisplay, BuilderAvatar, MultipleBuildersAvatar, UsdValue } from '../shared'
import { TransactionHistoryType } from '../../utils/types'
import { TransactionAmount } from '../../config/table.config'
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
  builderAddress?: Address
  isGrouped?: boolean
}

export const MobileFromToCell: FC<MobileFromToCellProps> = ({ builder, builderAddress, isGrouped }) => {
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

export const MobileTypeCell: FC<MobileTypeCellProps> = ({ type }) => {
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

export const MobileAmountCell: FC<MobileAmountCellProps> = ({ amounts, type, increased }) => {
  return (
    <MobileCellWrapper label="Amount">
      <AmountDisplay amounts={amounts} type={type} increased={increased} variant="mobile" />
    </MobileCellWrapper>
  )
}

interface MobileTotalAmountCellProps {
  usd: string | string[]
}

export const MobileTotalAmountCell: FC<MobileTotalAmountCellProps> = ({ usd }) => {
  return (
    <MobileCellWrapper label="Total amount (USD)">
      <UsdValue usd={usd} variant="mobile" />
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
