import { CsvIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'
import { HTMLAttributes, useState } from 'react'
import { Address, getAddress } from 'viem'
import { TransactionHistoryItem } from '@/app/my-rewards/tx-history/utils/types'
import { Duration } from 'luxon'
import { GetPricesResult } from '@/app/user/types'
import { Builder } from '@/app/collective-rewards/types'
import {
  calculateCycleNumber,
  formatDateForCsv,
  processTransactionAmount,
} from '@/app/my-rewards/tx-history/utils/utils'
import { TOKENS } from '@/lib/tokens'

const MAX_EXPORT_ROWS = 50000

const reorderTableByGrouping = (items: TransactionHistoryItem[]): TransactionHistoryItem[] => {
  const groupedByTransactionHash = new Map<string, TransactionHistoryItem[]>()

  items.forEach(item => {
    const existing = groupedByTransactionHash.get(item.transactionHash)
    if (existing) {
      existing.push(item)
    } else {
      groupedByTransactionHash.set(item.transactionHash, [item])
    }
  })

  const reorderedItems: TransactionHistoryItem[] = []
  groupedByTransactionHash.forEach(groupItems => {
    reorderedItems.push(...groupItems)
  })

  return reorderedItems
}

interface Props extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  address?: Address
  type?: string[]
  builder?: string[]
  rewardToken?: string[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  cycleDuration?: Duration
  prices?: GetPricesResult
  getBuilderByAddress?: (address: Address) => Builder | undefined
}

const convertItemToCsvRow = (
  item: TransactionHistoryItem,
  cycleDuration: Duration,
  prices: GetPricesResult,
  getBuilderByAddress: (address: Address) => Builder | undefined,
): string[] => {
  const cycleNumber = calculateCycleNumber(item.cycleStart, cycleDuration)
  const date = formatDateForCsv(item.blockTimestamp)
  const builderAddress = getAddress(item.builder)
  const builder = getBuilderByAddress(builderAddress)
  const builderName = builder?.builderName || builderAddress

  const { amount, symbol, usdValue } = processTransactionAmount(item, prices)
  const increased = item.increased !== undefined ? (item.increased ? 'Yes' : 'No') : ''

  return [
    cycleNumber.toString(),
    date,
    builderName,
    builderAddress,
    item.type,
    increased,
    amount,
    symbol,
    usdValue,
    item.transactionHash,
    item.blockHash,
  ]
}

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const generateCsv = (rows: string[][]): string => {
  const headers = [
    'Cycle',
    'Date',
    'Builder Name',
    'Builder Address',
    'Type',
    'Increased',
    'Amount',
    'Token',
    'USD Value',
    'Transaction Hash',
    'Block Hash',
  ]

  const csvRows = [headers.map(escapeCsvValue), ...rows.map(row => row.map(escapeCsvValue))]

  return csvRows.map(row => row.join(',')).join('\n')
}

const fetchAllTransactionHistory = async (
  address: Address,
  sortBy: string,
  sortDirection: 'asc' | 'desc',
  type: string[],
  builder: string[],
  rewardToken: string[],
  prices: GetPricesResult,
): Promise<TransactionHistoryItem[]> => {
  const pageSize = 1000
  const allData: TransactionHistoryItem[] = []
  let totalCount = 0

  // Build base search params
  const buildSearchParams = (page: number) => {
    const searchParams = new URLSearchParams({
      sortBy,
      sortDirection,
      pageSize: pageSize.toString(),
      page: page.toString(),
    })

    type.forEach(t => searchParams.append('type', t))
    builder.forEach(b => searchParams.append('builder', b))
    rewardToken.forEach(rt => searchParams.append('rewardToken', rt))

    Object.values(TOKENS).forEach(token => {
      const priceInfo = prices[token.symbol]
      if (!priceInfo) return

      const decimals = 18
      searchParams.append('price', `${token.address.toLowerCase()}:${priceInfo.price}:${decimals}`)
    })

    return searchParams
  }

  // Fetch first page to get total count
  const firstPageParams = buildSearchParams(1)
  const firstResponse = await fetch(`/api/backers/${address}/tx-history/context?${firstPageParams}`)

  if (!firstResponse.ok) {
    throw new Error('Failed to fetch transaction history')
  }

  const firstResult = await firstResponse.json()
  allData.push(...(firstResult.data || []))
  totalCount = firstResult.count || 0

  // If we got all data in the first page, return early
  if (allData.length >= totalCount) {
    return allData
  }

  // Calculate how many more pages we need to fetch
  const totalPages = Math.ceil(totalCount / pageSize)

  // Fetch remaining pages in parallel (or sequentially if preferred)
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
  const fetchPromises = remainingPages.map(async page => {
    const searchParams = buildSearchParams(page)
    const response = await fetch(`/api/backers/${address}/tx-history/context?${searchParams}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction history page ${page}`)
    }

    const result = await response.json()
    return result.data || []
  })

  // Wait for all pages to be fetched
  const remainingPagesData = await Promise.all(fetchPromises)
  remainingPagesData.forEach(pageData => {
    allData.push(...pageData)
  })

  return allData
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
  cycleDuration,
  prices,
  getBuilderByAddress,
  ...props
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!address || isDownloading || !cycleDuration || !prices || !getBuilderByAddress) return

    setIsDownloading(true)

    try {
      // Fetch all transaction history data
      const allData = await fetchAllTransactionHistory(
        address,
        sortBy,
        sortDirection,
        type,
        builder,
        rewardToken,
        prices,
      )

      if (allData.length === 0) {
        showToast({
          severity: 'info',
          title: 'No data',
          content: 'No transaction history data to export',
        })
        return
      }

      const reorderedData = reorderTableByGrouping(allData)

      // Limit to MAX_EXPORT_ROWS to avoid freezing the browser
      const dataToExport = reorderedData.slice(0, MAX_EXPORT_ROWS)
      const wasTruncated = reorderedData.length > MAX_EXPORT_ROWS

      if (wasTruncated) {
        showToast({
          severity: 'warning',
          title: 'Export limited',
          content: `Export limited to ${MAX_EXPORT_ROWS.toLocaleString()} rows to prevent browser freezing. Total available: ${reorderedData.length.toLocaleString()} rows.`,
        })
      }

      // Convert each item to CSV row
      const csvRows = dataToExport.map(item =>
        convertItemToCsvRow(item, cycleDuration, prices, getBuilderByAddress),
      )

      // Generate CSV string
      const csvContent = generateCsv(csvRows)

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transaction-history-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (!wasTruncated) {
        showToast({
          severity: 'success',
          title: 'Export successful',
          content: `CSV exported successfully with ${dataToExport.length.toLocaleString()} transaction${dataToExport.length !== 1 ? 's' : ''}`,
        })
      }
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
      disabled={disabled || !address || isDownloading || !cycleDuration || !prices || !getBuilderByAddress}
      onClick={handleDownload}
      className={cn({ 'opacity-50': disabled || !address || isDownloading }, className)}
      data-testid="CsvButton"
      {...props}
    >
      <CsvIcon size={22} />
    </button>
  )
}
