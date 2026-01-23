import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getStakingHistoryFromDB,
  getStakingHistoryCountFromDB,
} from '@/app/api/staking/v1/addresses/[address]/history/action'
import { RIF, STRIF, CHAIN_ID } from '@/lib/constants'
import { getFiatAmount } from '@/app/shared/formatter'
import Big from 'big.js'

const SortFieldEnum = z.enum(['period', 'amount', 'action'])
const SortDirectionEnum = z.enum(['asc', 'desc'])
const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format')
const QuerySchema = z.object({
  sort_field: SortFieldEnum.default('period'),
  sort_direction: SortDirectionEnum.default('desc'),
  type: z.array(z.enum(['stake', 'unstake'])).optional(),
})

// Helper functions for CSV formatting
const formatSymbolForCsv = (value: bigint | string, symbol: string): string => {
  if (!value || value === '0') {
    return '0'
  }
  const { decimals, displayDecimals } = {
    strif: { decimals: 18, displayDecimals: 6 },
  }[symbol.toLowerCase()] ?? {
    decimals: 18,
    displayDecimals: 6,
  }

  const amount = Big(value.toString()).div(Big(10).pow(decimals))

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(amount.toString() as never)
}

const formatCurrencyForCsv = (amount: bigint | string, price: number): string => {
  const usdAmount = getFiatAmount(BigInt(amount.toString()), price)
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(usdAmount.toString() as never)
}

const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

const formatDateForCsv = (timestamp: string | number): string => {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Match frontend format (24-hour format)
  })
}

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Fetch RIF price (STRIF uses the same price as RIF)
async function getRifPrice(): Promise<number> {
  try {
    const { tokenContracts } = await import('@/lib/contracts')
    const { fetchPricesEndpoint } = await import('@/lib/endpoints')
    const rifAddress = tokenContracts[RIF]

    if (!rifAddress) {
      console.error('RIF address not found in token contracts')
      return 0
    }

    // Build the price API URL
    const baseUrl = process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS || fetchPricesEndpoint
    const url = baseUrl
      .replace('{{addresses}}', rifAddress)
      .replace('{{convert}}', 'USD')
      .replace('chainId={{chainId}}', `chainId=${CHAIN_ID}`)

    // Use absolute URL if it's a relative path
    const fullUrl = url.startsWith('http')
      ? url
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${url}`

    const priceResponse = await fetch(fullUrl, {
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (priceResponse.ok) {
      const priceData = await priceResponse.json()
      // Price API returns data keyed by address
      const price = priceData[rifAddress]?.price
      if (!price || price === 0) {
        console.error('RIF price is 0 or missing from API response:', priceData)
      }
      // Price is returned as a number (USD per token)
      // getFiatAmount expects price in USD format (it handles the wei conversion internally)
      return price ? Number(price) : 0
    } else {
      console.error('Failed to fetch RIF price:', priceResponse.status, priceResponse.statusText)
    }
  } catch (error) {
    console.error('Error fetching RIF price:', error)
  }
  return 0
}

export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam)
    const searchParams = new URL(req.url).searchParams

    // Handle multiple 'type' query params
    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
      sort_field: searchParams.get('sort_field') || undefined,
      sort_direction: searchParams.get('sort_direction') || undefined,
      type: typeParams.length > 0 ? typeParams : undefined,
    })

    // Get RIF price for USD conversion
    const rifPrice = await getRifPrice()

    // Create a readable stream for CSV
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder()

          // Write CSV headers
          const headers = [
            'Period',
            'Period (YYYY-MM)',
            'Date',
            'Action',
            'Amount',
            'Token',
            'USD Value',
            'Transaction Hash',
          ]
          controller.enqueue(encoder.encode(headers.map(escapeCsvValue).join(',') + '\n'))

          // Fetch all data in batches from database
          const pageSize = 200
          let offset = 0
          let hasMoreData = true

          while (hasMoreData) {
            const batch = await getStakingHistoryFromDB({
              address,
              limit: pageSize,
              offset,
              sort_field: parsed.sort_field,
              sort_direction: parsed.sort_direction,
              type: parsed.type,
            })

            if (batch.length === 0) {
              hasMoreData = false
              break
            }

            // Process each item and expand transactions
            for (const item of batch) {
              for (const transaction of item.transactions) {
                const periodFormatted = formatPeriod(item.period)
                const date = formatDateForCsv(String(transaction.timestamp))
                const amount = formatSymbolForCsv(transaction.amount, STRIF)
                const usdValue = formatCurrencyForCsv(transaction.amount, rifPrice)
                const action = transaction.action

                const row = [
                  periodFormatted,
                  item.period,
                  date,
                  action,
                  amount,
                  STRIF,
                  usdValue,
                  transaction.transactionHash,
                ]

                controller.enqueue(encoder.encode(row.map(escapeCsvValue).join(',') + '\n'))
              }
            }

            // Check if we've fetched all data
            if (batch.length < pageSize) {
              hasMoreData = false
            } else {
              offset += pageSize
              // Double-check by getting count
              const totalCount = await getStakingHistoryCountFromDB(address, parsed.type)
              if (offset >= totalCount) {
                hasMoreData = false
              }
            }
          }

          controller.close()
        } catch (streamError) {
          console.error('Error in CSV stream:', streamError)
          const errorMessage = streamError instanceof Error ? streamError.message : String(streamError)
          const encoder = new TextEncoder()
          // Try to send error as CSV row (though this might not work if stream already started)
          try {
            controller.enqueue(encoder.encode(`\nERROR: ${errorMessage}`))
          } catch {
            // If we can't enqueue, just close
          }
          controller.error(streamError)
        }
      },
    })

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="staking-history-${address.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    console.error('Error in staking history CSV route:', err)

    // Return detailed error information for debugging
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : undefined
    const errorName = err instanceof Error ? err.name : 'UnknownError'

    return Response.json(
      {
        error: 'Internal server error',
        message: errorMessage,
        name: errorName,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 },
    )
  }
}
