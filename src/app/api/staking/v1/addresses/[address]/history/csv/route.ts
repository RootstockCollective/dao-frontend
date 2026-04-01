import { NextRequest } from 'next/server'
import { z } from 'zod'

import { getStakingHistoryFromDB } from '@/app/api/staking/v1/addresses/[address]/history/action'
import {
  resolveStakingHistoryCsvPlan,
  stakingHistoryCsvSourceHeaders,
} from '@/app/api/staking/v1/addresses/[address]/history/sources/resolve-staking-history-csv-plan'
import { queryParam } from '@/app/api/utils/helpers'
import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'
import { getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { RIF, STRIF } from '@/lib/constants'
import { logger } from '@/lib/logger'

import type { StakingHistoryByPeriodAndAction } from '../types'

const SortFieldEnum = z.enum(['period', 'amount', 'action'])
const QuerySchema = z.object({
  sort_field: SortFieldEnum.default('period'),
  sort_direction: SortDirectionEnum.default('desc'),
  type: z.array(z.enum(['stake', 'unstake'])).optional(),
})

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
  }).format(Number(amount.toString()))
}

const formatCurrencyForCsv = (amount: bigint | string, price: number): string => {
  const usdAmount = getFiatAmount(BigInt(amount.toString()), price)
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(Number(usdAmount.toString()))
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
    hour12: false,
  })
}

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

/**
 * Writes one CSV line per transaction under `groups` into the stream (period, raw period, date, action, amount, symbol, USD, tx hash).
 *
 * @param controller — Stream controller for the CSV `Response` body.
 * @param encoder — UTF-8 encoder for row chunks.
 * @param groups — Already filtered/sorted staking history groups.
 * @param rifPrice — Spot price for fiat column via {@link getFiatAmount}.
 *
 * @example One encoded line (after `escapeCsvValue`; columns match `row` array order in code):
 * ```text
 * March 2025,2025-03,"15 Mar 2025, 14:30",STAKE,1.000000,stRIF,0.42,0xabc…
 * ```
 */
function enqueueHistoryGroupsAsCsvRows(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  groups: StakingHistoryByPeriodAndAction[],
  rifPrice: number,
): void {
  for (const item of groups) {
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
}

async function getRifPrice(): Promise<number> {
  const { fetchPrices } = await import('@/app/user/Balances/actions')
  const prices = await fetchPrices()
  return prices[RIF]?.price ?? 0
}

/**
 * GET CSV export for staking history. Uses DB batched reads when healthy; falls back to Blockscout (DAO-2058 Phase 2).
 * Headers `X-Source` and `x-source-name` match the JSON history route.
 *
 * @example Query string (same sort/filter vocabulary as JSON history; no pagination in query — stream is full export):
 * ```
 * ?sort_field=period&sort_direction=desc&type=stake&type=unstake
 * ```
 *
 * @example First streamed row (columns: human period, `YYYY-MM`, tx datetime, action, amount, symbol, USD, tx hash):
 * ```csv
 * March 2025,2025-03,"15 Mar 2025, 14:30",STAKE,1.000000,stRIF,0.42,0xabc…
 * ```
 */
export async function GET(req: NextRequest, context: { params: Promise<{ address: string }> }) {
  try {
    const { address: addressParam } = await context.params
    const address = AddressSchema.parse(addressParam).toLowerCase()
    const searchParams = new URL(req.url).searchParams
    const qp = queryParam(searchParams)
    const typeParams = searchParams.getAll('type').filter(v => v !== '')

    const parsed = QuerySchema.parse({
      sort_field: qp('sort_field'),
      sort_direction: qp('sort_direction'),
      type: typeParams.length > 0 ? typeParams : undefined,
    })

    const sortParams = {
      sort_field: parsed.sort_field,
      sort_direction: parsed.sort_direction,
      type: parsed.type,
    }

    const pageSize = 200
    const rifPrice = await getRifPrice()
    const plan = await resolveStakingHistoryCsvPlan(address, sortParams, pageSize)
    const sourceHeaders = stakingHistoryCsvSourceHeaders(plan)

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const encoder = new TextEncoder()

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

          if (plan.kind === 'blockscout') {
            enqueueHistoryGroupsAsCsvRows(controller, encoder, plan.groups, rifPrice)
            controller.close()
            return
          }

          enqueueHistoryGroupsAsCsvRows(controller, encoder, plan.firstBatch, rifPrice)

          let offset = plan.firstBatch.length
          let hasMoreData = offset < plan.totalCount

          while (hasMoreData) {
            const batch = await getStakingHistoryFromDB({
              address: plan.address,
              limit: plan.pageSize,
              offset,
              sort_field: plan.sortParams.sort_field,
              sort_direction: plan.sortParams.sort_direction,
              type: plan.sortParams.type,
            })

            if (batch.length === 0) {
              hasMoreData = false
              break
            }

            enqueueHistoryGroupsAsCsvRows(controller, encoder, batch, rifPrice)

            if (batch.length < plan.pageSize) {
              hasMoreData = false
            } else {
              offset += plan.pageSize
              if (offset >= plan.totalCount) {
                hasMoreData = false
              }
            }
          }

          controller.close()
        } catch (streamError) {
          logger.error(
            { err: streamError, route: '/api/staking/v1/addresses/[address]/history/csv' },
            'Error in CSV stream',
          )
          const errorMessage = streamError instanceof Error ? streamError.message : String(streamError)
          const encoder = new TextEncoder()
          try {
            controller.enqueue(encoder.encode(`\nERROR: ${errorMessage}`))
          } catch {
            // If we can't enqueue, just close
          }
          controller.error(streamError)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="staking-history-${address.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache',
        ...sourceHeaders,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: err.flatten() }, { status: 400 })
    }
    logger.error(
      { err, route: '/api/staking/v1/addresses/[address]/history/csv' },
      'Error in staking history CSV route',
    )

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
