'use client'

import { DateTime } from 'luxon'
import { ButtonHTMLAttributes, useState } from 'react'

import { CsvIcon } from '@/components/Icons/CsvIcon'
import { RBTC, WRBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'

import { AUDIT_LOG_FETCH_LIMIT } from '../constants'
import type { AuditLogApiEntry, AuditLogApiFilters, AuditLogApiResponse, SortableColumnId } from '../types'
import { buildAuditLogUrl, formatAmountFromWei, formatAuditLogDateForCsv } from '../utils'

/** Maximum number of pages to fetch concurrently. */
const FETCH_CONCURRENCY_LIMIT = 5

/** Maximum number of rows to export. */
const MAX_EXPORT_ROWS = 50000

interface AuditLogExportData {
  entries: AuditLogApiEntry[]
  totalRows: number
}

// Prevent CSV formula injection: Excel/Sheets evaluate values starting with =, +, -, @
function sanitizeCsvFormulaValue(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value
}

// Sanitize CSV value to prevent formula injection and line breaks
function sanitizeCsvValue(value: string): string {
  const sanitized = sanitizeCsvFormulaValue(value)
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replaceAll('"', '""')}"`
  }
  return sanitized
}

function generateCsv(rows: string[][]): string {
  const headers = ['Date', 'Action', 'Reason', 'Token Amount', 'Token Symbol', 'Role', 'Transaction Hash']
  const csvRows = [headers.map(sanitizeCsvValue), ...rows.map(r => r.map(sanitizeCsvValue))]
  return csvRows.map(r => r.join(',')).join('\n')
}

async function fetchAuditLogPage(
  page: number,
  limit: number,
  sortField: SortableColumnId | null,
  sortDirection: 'asc' | 'desc' | null,
  filters?: AuditLogApiFilters,
): Promise<AuditLogApiResponse> {
  const res = await fetch(buildAuditLogUrl({ page, limit, sortField, sortDirection, filters }), {
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch audit log page ${page}: ${res.status} ${text}`)
  }
  return (await res.json()) as AuditLogApiResponse
}

async function fetchAllAuditLogEntries(
  sortField: SortableColumnId | null,
  sortDirection: 'asc' | 'desc' | null,
  filters?: AuditLogApiFilters,
): Promise<AuditLogExportData> {
  const limit = AUDIT_LOG_FETCH_LIMIT
  const firstPage = await fetchAuditLogPage(1, limit, sortField, sortDirection, filters)
  const allData: AuditLogApiEntry[] = [...(firstPage.data ?? [])]
  const totalRows = firstPage.pagination?.total ?? allData.length

  if (allData.length >= totalRows || allData.length >= MAX_EXPORT_ROWS) {
    return { entries: allData.slice(0, MAX_EXPORT_ROWS), totalRows }
  }

  const rowsToFetch = Math.min(totalRows, MAX_EXPORT_ROWS)
  const totalPagesToFetch = Math.ceil(rowsToFetch / limit)
  const remainingPages = Array.from({ length: Math.max(totalPagesToFetch - 1, 0) }, (_, i) => i + 2)

  // Fetch remaining pages in batches to avoid overwhelming the server or the browser
  for (let i = 0; i < remainingPages.length; i += FETCH_CONCURRENCY_LIMIT) {
    const batch = remainingPages.slice(i, i + FETCH_CONCURRENCY_LIMIT)
    const batchData = await Promise.all(
      batch.map(page => fetchAuditLogPage(page, limit, sortField, sortDirection, filters)),
    )
    for (const pageData of batchData) {
      if (allData.length >= MAX_EXPORT_ROWS) break
      const rowsLeft = MAX_EXPORT_ROWS - allData.length
      allData.push(...(pageData.data ?? []).slice(0, rowsLeft))
    }
  }

  return { entries: allData, totalRows }
}

function entryToCsvRow(entry: AuditLogApiEntry): string[] {
  return [
    formatAuditLogDateForCsv(entry.blockTimestamp),
    entry.type,
    entry.detail?.trim() ?? '',
    formatAmountFromWei(entry.amountInWei, 18) ?? '',
    entry.isNative === false ? WRBTC : RBTC,
    entry.role ?? '',
    entry.transactionHash,
  ]
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  sortField: SortableColumnId | null
  sortDirection: 'asc' | 'desc' | null
  filters?: AuditLogApiFilters
  disabled?: boolean
}

export function AuditLogCsvButton({
  className,
  disabled = false,
  sortField,
  sortDirection,
  filters,
  ...props
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (disabled || isDownloading) return

    setIsDownloading(true)
    try {
      const { entries: allData, totalRows } = await fetchAllAuditLogEntries(sortField, sortDirection, filters)

      if (allData.length === 0) {
        showToast({
          severity: 'info',
          title: 'No data',
          content: 'No audit log data to export',
        })
        return
      }

      const dataToExport = allData.slice(0, MAX_EXPORT_ROWS)
      const wasTruncated = totalRows > MAX_EXPORT_ROWS

      if (wasTruncated) {
        showToast({
          severity: 'warning',
          title: 'Export limited',
          content: `Export limited to ${MAX_EXPORT_ROWS.toLocaleString()} rows to prevent browser freezing. Total available: ${totalRows.toLocaleString()} rows.`,
        })
      }

      const csvRows = dataToExport.map(entry => entryToCsvRow(entry))
      const csvContent = generateCsv(csvRows)
      const date = DateTime.now().toFormat('yyyy-MM-dd')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `audit-log-${date}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      if (!wasTruncated) {
        showToast({
          severity: 'success',
          title: 'Export successful',
          content: `CSV exported successfully with ${dataToExport.length.toLocaleString()} event${dataToExport.length !== 1 ? 's' : ''}`,
        })
      }
    } catch (error) {
      console.error('Error exporting audit log CSV:', error)
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
      disabled={disabled || isDownloading}
      onClick={handleDownload}
      className={cn({ 'opacity-50': disabled || isDownloading }, className)}
      aria-label="Export CSV"
      data-testid="AuditLogCsvButton"
      {...props}
    >
      <CsvIcon size={24} color="white" />
    </button>
  )
}
