'use client'

import { HTMLAttributes, useCallback, useState } from 'react'

import { CsvIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'

import type { DepositHistoryCellDataMap } from './DepositHistoryTable.config'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  rows: { data: DepositHistoryCellDataMap }[]
  disabled?: boolean
}

const CSV_HEADERS = ['Deposit Window', 'Start Date', 'End Date', 'TVL', 'TVL (USD)', 'APY']

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Button that exports the current deposit history table as a CSV file.
 * Uses client-side data already loaded by useDepositHistory.
 *
 * TODO: Move CSV generation to a backend API route (like StakingHistoryCsvButton)
 * so it can export all data regardless of client-side pagination limits.
 */
export function DepositHistoryCsvButton({ className, disabled = false, rows, ...props }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(() => {
    if (isDownloading || rows.length === 0) return

    setIsDownloading(true)

    try {
      const csvRows = rows.map(({ data }) =>
        [data.depositWindow, data.startDate, data.endDate, data.tvl, data.fiatTvl ?? '', data.apy].map(
          escapeCsvValue,
        ),
      )

      const csvContent = [CSV_HEADERS.map(escapeCsvValue), ...csvRows].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `tvl-history-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast({
        severity: 'success',
        title: 'Export successful',
        content: `CSV exported with ${rows.length} epoch${rows.length !== 1 ? 's' : ''}`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      showToast({
        severity: 'error',
        title: 'Export failed',
        content: error instanceof Error ? error.message : 'Failed to export CSV',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [isDownloading, rows])

  return (
    <button
      disabled={disabled || rows.length === 0 || isDownloading}
      onClick={handleDownload}
      className={cn({ 'opacity-50': disabled || rows.length === 0 || isDownloading }, className)}
      data-testid="DepositHistoryCsvButton"
      {...props}
    >
      <CsvIcon />
    </button>
  )
}
