'use client'

import { DateTime } from 'luxon'
import { ButtonHTMLAttributes, useState } from 'react'

import { CsvIcon } from '@/components/Icons/CsvIcon'
import { RBTC, WRBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { showToast } from '@/shared/notification'

import { AUDIT_LOG_FETCH_LIMIT } from '../constants'
import type { AuditLogApiResponse, AuditLogEntry, SortableColumnId } from '../types'
import { buildAuditLogUrl, formatAmountFromWei, formatAuditLogDateForCsv } from '../utils'
const MAX_EXPORT_ROWS = 50000

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function generateCsv(rows: string[][]): string {
  const headers = ['ID', 'Date', 'Action', 'Detail', 'Token Amount', 'Token Symbol', 'Role']
  const csvRows = [headers.map(escapeCsvValue), ...rows.map(r => r.map(escapeCsvValue))]
  return csvRows.map(r => r.join(',')).join('\n')
}

async function fetchAllAuditLogEntries(
  sortField: SortableColumnId | null,
  sortDirection: 'asc' | 'desc' | null,
): Promise<AuditLogEntry[]> {
  const limit = AUDIT_LOG_FETCH_LIMIT

  const firstUrl = buildAuditLogUrl({ page: 1, limit, sortField, sortDirection })
  const firstRes = await fetch(firstUrl, { cache: 'no-store' })
  if (!firstRes.ok) {
    const text = await firstRes.text()
    throw new Error(`Failed to fetch audit log: ${firstRes.status} ${text}`)
  }

  const firstJson = (await firstRes.json()) as AuditLogApiResponse
  const allData: AuditLogEntry[] = [...(firstJson.data ?? [])]
  const total = firstJson.pagination?.total ?? allData.length

  if (allData.length >= total) return allData

  const totalPages = Math.ceil(total / limit)
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

  const fetchPromises = remainingPages.map(async page => {
    const url = buildAuditLogUrl({ page, limit, sortField, sortDirection })
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to fetch audit log page ${page}: ${res.status} ${text}`)
    }
    const json = (await res.json()) as AuditLogApiResponse
    return json.data ?? []
  })

  const remainingData = await Promise.all(fetchPromises)
  remainingData.forEach(pageRows => {
    allData.push(...pageRows)
  })

  return allData
}

function entryToCsvRow(entry: AuditLogEntry): string[] {
  return [
    String(entry.id),
    formatAuditLogDateForCsv(entry.blockTimestamp),
    entry.type,
    entry.detail?.trim() ?? '',
    formatAmountFromWei(entry.amountInWei, 18) ?? '',
    entry.isNative === false ? WRBTC : RBTC,
    entry.role ?? '',
  ]
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  sortField: SortableColumnId | null
  sortDirection: 'asc' | 'desc' | null
  disabled?: boolean
}

export function AuditLogCsvButton({
  className,
  disabled = false,
  sortField,
  sortDirection,
  ...props
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (disabled || isDownloading) return

    setIsDownloading(true)
    try {
      const allData = await fetchAllAuditLogEntries(sortField, sortDirection)

      if (allData.length === 0) {
        showToast({
          severity: 'info',
          title: 'No data',
          content: 'No audit log data to export',
        })
        return
      }

      const dataToExport = allData.slice(0, MAX_EXPORT_ROWS)
      const wasTruncated = allData.length > MAX_EXPORT_ROWS

      if (wasTruncated) {
        showToast({
          severity: 'warning',
          title: 'Export limited',
          content: `Export limited to ${MAX_EXPORT_ROWS.toLocaleString()} rows to prevent browser freezing. Total available: ${allData.length.toLocaleString()} rows.`,
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
