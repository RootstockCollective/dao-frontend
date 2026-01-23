'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Paragraph } from '@/components/Typography'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon'
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon'
import { TokenImage } from '@/components/TokenImage'
import { VaultHistoryTable } from './VaultHistoryTable.config'

const TOKEN_SYMBOL = 'USDRIF'

interface MobileVaultHistoryCardProps {
  row: VaultHistoryTable['Row']
}

export const MobileVaultHistoryCard = ({ row }: MobileVaultHistoryCardProps) => {
  const {
    data: { period, action, assets, transactions, total_usd },
  } = row

  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const formattedAction = action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()
  const isDeposit = action === 'DEPOSIT'
  const hasTransactions = transactions && transactions.length > 0

  return (
    <div className="flex flex-col bg-v3-bg-accent-80 rounded-sm border-b border-b-v3-bg-accent-60">
      {/* Main Card Content */}
      <div className="flex flex-col p-4 gap-3">
        {/* Row 1: Period */}
        <div className="flex items-center justify-between">
          <Paragraph variant="body-s" className="text-v3-text-100">
            {period}
          </Paragraph>
          {hasTransactions && (
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
              data-testid="MobileVaultHistoryToggleButton"
            >
              <Paragraph variant="body-s" className="text-v3-text-100 font-medium">
                {isExpanded ? 'Hide' : 'Show'} details
              </Paragraph>
              {isExpanded ? (
                <ChevronUpIcon size={12} color="currentColor" />
              ) : (
                <ChevronDownIcon size={12} color="currentColor" />
              )}
            </button>
          )}
        </div>

        {/* Row 2: Action Type */}
        <div className="flex items-center">
          <Paragraph variant="body" className="text-v3-text-100">
            {formattedAction}
          </Paragraph>
        </div>

        {/* Row 3: Amount */}
        <div className="flex items-center gap-1">
          <span className="flex items-center">
            {isDeposit ? <ArrowUpIcon size={16} color="#1bc47d" /> : <ArrowDownIcon size={16} color="#f68" />}
          </span>
          <Paragraph variant="body" className={cn(isDeposit ? 'text-v3-success' : 'text-error')}>
            {assets}
          </Paragraph>
          <TokenImage symbol={'USDRIF'} size={16} />
          <Paragraph variant="body" className="text-v3-text-100">
            {TOKEN_SYMBOL}
          </Paragraph>
        </div>

        {/* Row 4: Total Amount (USD) */}
        <div className="flex items-center">
          <Paragraph variant="body" className="text-v3-text-100">
            ${total_usd}
          </Paragraph>
        </div>
      </div>

      {/* Expanded Transactions */}
      {isExpanded && hasTransactions && (
        <div className="border-t border-t-v3-bg-accent-60 bg-v3-bg-accent-100">
          <div className="flex flex-col gap-0">
            {transactions.map((detail, idx) => {
              const detailIsDeposit = detail.action === 'DEPOSIT'
              return (
                <div
                  key={`${row.id}-detail-${idx}`}
                  className={cn(
                    'flex flex-col p-4 gap-3',
                    idx < transactions.length - 1 && 'border-b border-b-v3-bg-accent-60',
                  )}
                  data-testid="MobileVaultHistoryDetailRow"
                >
                  {/* Detail Row 1: Date */}
                  <Paragraph variant="body-s" className="text-v3-text-100">
                    {detail.date}
                  </Paragraph>

                  {/* Detail Row 2: Action Type */}
                  <Paragraph variant="body" className="text-v3-text-100">
                    {detail.action.charAt(0).toUpperCase() + detail.action.slice(1).toLowerCase()}
                  </Paragraph>

                  {/* Detail Row 3: Amount */}
                  <div className="flex items-center gap-1">
                    <span className="flex items-center">
                      {detailIsDeposit ? (
                        <ArrowUpIcon size={16} color="#1bc47d" />
                      ) : (
                        <ArrowDownIcon size={16} color="#f68" />
                      )}
                    </span>
                    <Paragraph
                      variant="body"
                      className={cn(detailIsDeposit ? 'text-v3-success' : 'text-error')}
                    >
                      {detail.assets}
                    </Paragraph>
                    <TokenImage symbol={'USDRIF'} size={16} />
                    <Paragraph variant="body" className="text-v3-text-100">
                      {TOKEN_SYMBOL}
                    </Paragraph>
                  </div>

                  {/* Detail Row 4: Total Amount (USD) */}
                  <Paragraph variant="body" className="text-v3-text-100">
                    ${(Number(detail.assets.replace(/[^0-9.]/g, '')) || 0).toFixed(2)}
                  </Paragraph>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
