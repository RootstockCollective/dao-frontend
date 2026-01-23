'use client'

import { CsvIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'
import { HTMLAttributes, useState } from 'react'
import { Address } from 'viem'
import { getStakingHistoryEndpoint } from '@/lib/endpoints'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  address?: Address
  type?: string[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

/**
 * Button that downloads staking history as CSV from backend
 */
export function StakingHistoryCsvButton({
  className,
  disabled = false,
  address,
  type = [],
  sortBy = 'period',
  sortDirection = 'desc',
  ...props
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!address || isDownloading) return

    setIsDownloading(true)

    try {
      // Build CSV endpoint URL
      const csvEndpoint = getStakingHistoryEndpoint.replace('{{address}}', address.toLowerCase()) + '/csv'
      const searchParams = new URLSearchParams({
        sort_field: sortBy || 'period',
        sort_direction: sortDirection,
      })

      // Add type filters
      type.forEach(t => searchParams.append('type', t))

      const url = `${csvEndpoint}?${searchParams}`

      // Fetch CSV from backend
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to export CSV' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Get the CSV content as blob
      const blob = await response.blob()

      // Create download link
      const link = document.createElement('a')
      const urlObject = URL.createObjectURL(blob)
      link.setAttribute('href', urlObject)
      link.setAttribute(
        'download',
        `staking-history-${address.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`,
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(urlObject)

      showToast({
        severity: 'success',
        title: 'Export successful',
        content: 'CSV file downloaded successfully',
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
  }

  return (
    <button
      disabled={disabled || !address || isDownloading}
      onClick={handleDownload}
      className={cn({ 'opacity-50': disabled || !address || isDownloading }, className)}
      data-testid="StakingHistoryCsvButton"
      {...props}
    >
      <CsvIcon />
    </button>
  )
}
