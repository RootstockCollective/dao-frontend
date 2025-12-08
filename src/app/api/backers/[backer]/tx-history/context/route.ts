import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Address, isAddress } from 'viem'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { TX_HISTORY_COLUMNS } from '@/app/api/db/constants'
import { createCsvReadableStream, createCsvResponse } from '@/app/api/utils/csvStream'

export const runtime = 'nodejs'

// ---------- Utils ----------

function parseMultiParam(search: URLSearchParams, key: string): string[] {
  const values = search.getAll(key)
  return values
    .flatMap(v => v.split(','))
    .map(v => v.trim())
    .filter(Boolean)
}

// ---------- Route ----------

export async function GET(req: Request, { params }: { params: Promise<{ backer: Address }> }) {
  const { backer } = await params

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const url = new URL(req.url || '')
    const search = url.searchParams

    const format = search.get('format') // 'csv' or null

    const typeFiltersRaw = parseMultiParam(search, 'type') // Back | Claim
    const builderFiltersRaw = parseMultiParam(search, 'builder')
    const rewardTokenFiltersRaw = parseMultiParam(search, 'rewardToken')

    const builderFilters = builderFiltersRaw.map(b => b.toLowerCase())
    const rewardTokenFilters = rewardTokenFiltersRaw.map(r => r.toLowerCase())

    if (builderFilters.length && !builderFilters.every(b => isAddress(b as Address))) {
      return NextResponse.json({ error: 'Invalid builder address in filter' }, { status: 400 })
    }
    if (rewardTokenFilters.length && !rewardTokenFilters.every(r => isAddress(r as Address))) {
      return NextResponse.json({ error: 'Invalid rewardToken address in filter' }, { status: 400 })
    }

    const paginationResult = parsePaginationParams(req.url || '', TX_HISTORY_COLUMNS)

    if (!paginationResult.success && format !== 'csv') {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortBy, sortDirection } = paginationResult.success
      ? paginationResult.data
      : {
          page: 1,
          pageSize: 10,
          sortBy: 'blockTimestamp',
          sortDirection: 'desc' as const,
        }

    const limitToBack = typeFiltersRaw.length > 0 && !typeFiltersRaw.includes('Claim')
    const limitToClaim =
      (typeFiltersRaw.length > 0 && !typeFiltersRaw.includes('Back')) || rewardTokenFilters.length > 0

    const backerLower = backer.toLowerCase() as Address

    const allocationHistory = db('AllocationHistory')
      .select(
        'id',
        db.raw("'Back' as type"),
        'backer',
        'builder',
        'blockHash',
        'blockTimestamp',
        'transactionHash',
        'cycleStart',
        db.raw('allocation as amount'),
        'increased',
        db.raw('NULL as "rewardToken"'),
      )
      .where('backer', '=', backerLower)
      .modify(qb => {
        if (builderFilters.length) qb.whereIn('builder', builderFilters)
        if (limitToClaim) qb.whereRaw('FALSE')
      })

    const claimedRewardsHistory = db('ClaimedRewardsHistory')
      .select(
        'id',
        db.raw("'Claim' as type"),
        'backer',
        'builder',
        'blockHash',
        'blockTimestamp',
        'transactionHash',
        'cycleStart',
        'amount',
        db.raw('NULL as increased'),
        'rewardToken',
      )
      .where('backer', '=', backerLower)
      .modify(qb => {
        if (builderFilters.length) qb.whereIn('builder', builderFilters)
        if (rewardTokenFilters.length) qb.whereIn('rewardToken', rewardTokenFilters)
        if (limitToBack) qb.whereRaw('FALSE')
      })

    // union loses some typing, so we reassert it to the correct shape
    const combinedQuery = allocationHistory.union(claimedRewardsHistory)

    // ---------- CSV streaming mode ----------
    if (format === 'csv') {
      const orderedQuery = combinedQuery.clone().orderBy(sortBy || 'blockTimestamp', sortDirection || 'desc')

      const stream = createCsvReadableStream(orderedQuery)
      const filename = `tx-history-${backerLower}.csv`

      return createCsvResponse(stream, filename)
    }

    // ---------- Default JSON (paginated) ----------
    const [data, countResult] = await Promise.all([
      combinedQuery
        .clone()
        .orderBy(sortBy || 'blockTimestamp', sortDirection || 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.count('* as count').from(combinedQuery.clone()).first(),
    ])

    const count = Number(countResult?.count ?? 0)

    return NextResponse.json({
      data,
      count,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
