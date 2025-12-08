import { CsvIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'
import { HTMLAttributes, useState } from 'react'
import { Address } from 'viem'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  address?: Address
  type?: string[]
  builder?: string[]
  rewardToken?: string[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

/**
 * Button that downloads transaction history as CSV
 */
export function CsvButton({
  className,
  disabled = false,
  address,
  type = [],
  builder = [],
  rewardToken = [],
  sortBy = 'blockTimestamp',
  sortDirection = 'desc',
  ...props
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!address || isDownloading) return

    setIsDownloading(true)
    try {
      const searchParams = new URLSearchParams({
        format: 'csv',
        sortBy,
        sortDirection,
      })

      // Add filter parameters
      type.forEach(t => searchParams.append('type', t))
      builder.forEach(b => searchParams.append('builder', b))
      rewardToken.forEach(rt => searchParams.append('rewardToken', rt))

      const response = await fetch(`/api/backers/${address}/tx-history/context?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to download CSV')
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] || `tx-history-${address.toLowerCase()}.csv`

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      showToast({
        severity: 'error',
        title: 'Error downloading CSV',
        content: error instanceof Error ? error.message : 'Unknown error',
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
      data-testid="CsvButton"
      {...props}
    >
      <CsvIcon />
    </button>
  )
}
