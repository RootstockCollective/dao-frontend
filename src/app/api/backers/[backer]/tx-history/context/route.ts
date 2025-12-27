import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Address, isAddress } from 'viem'
import { parsePaginationParams } from '@/app/api/utils/parsePaginationParams'
import { TX_HISTORY_COLUMNS } from '@/app/api/db/constants'

type PriceParam = {
  token: string
  priceUsd: number
  decimals: number
}

function parseMultiParam(search: URLSearchParams, key: string): string[] {
  const values = search.getAll(key)
  return values
    .flatMap(v => v.split(','))
    .map(v => v.trim())
    .filter(Boolean)
}

function parsePriceParams(search: URLSearchParams): PriceParam[] {
  const rawPrices = search.getAll('price')
  const prices: PriceParam[] = []

  for (const raw of rawPrices) {
    const [token, priceStr, decimalsStr] = raw.split(':')
    if (!token || !priceStr) continue

    const priceUsd = Number(priceStr)
    const decimals = decimalsStr ? Number(decimalsStr) : 18

    if (!Number.isFinite(priceUsd) || !Number.isFinite(decimals)) continue

    prices.push({
      token: token.toLowerCase(),
      priceUsd,
      decimals,
    })
  }

  return prices
}

function buildClaimAmountUsdExpression(prices: PriceParam[]) {
  if (!prices.length) {
    return db.raw('0::numeric as "amountUsd"')
  }

  let sql = 'amount::numeric * (CASE convert_from("rewardToken", \'utf8\')'
  const bindings: Array<string | number> = []

  for (const { token, priceUsd, decimals } of prices) {
    const factor = priceUsd / Math.pow(10, decimals || 18)
    sql += ' WHEN ? THEN ?::numeric'
    bindings.push(token, factor)
  }

  sql += ' ELSE 0::numeric END)'

  return db.raw(`${sql} as "amountUsd"`, bindings)
}

function buildAllocationAmountUsdExpression(prices: PriceParam[]) {
  // Allocation is always in stRIF; find its price entry if provided
  const stRifEntry = prices[0]

  if (!stRifEntry) {
    return db.raw('0::numeric as "amountUsd"')
  }

  const factor = stRifEntry.priceUsd / Math.pow(10, stRifEntry.decimals)

  const sql = '(CASE WHEN increased = false THEN -1 ELSE 1 END) * (allocation::numeric * ?::numeric)'

  return db.raw(`${sql} as "amountUsd"`, [factor])
}

export async function GET(req: Request, { params }: { params: Promise<{ backer: Address }> }) {
  const { backer } = await params

  if (!isAddress(backer)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const url = new URL(req.url || '')
    const search = url.searchParams

    const typeFiltersRaw = parseMultiParam(search, 'type') // Back | Claim
    const builderFiltersRaw = parseMultiParam(search, 'builder')
    const rewardTokenFiltersRaw = parseMultiParam(search, 'rewardToken')
    const priceParams = parsePriceParams(search)

    const builderFilters = builderFiltersRaw.map(b => b.toLowerCase())
    const rewardTokenFilters = rewardTokenFiltersRaw.map(r => r.toLowerCase())

    if (builderFilters.length && !builderFilters.every(b => isAddress(b as Address))) {
      return NextResponse.json({ error: 'Invalid builder address in filter' }, { status: 400 })
    }
    if (rewardTokenFilters.length && !rewardTokenFilters.every(r => isAddress(r as Address))) {
      return NextResponse.json({ error: 'Invalid rewardToken address in filter' }, { status: 400 })
    }

    const paginationResult = parsePaginationParams(req.url || '', TX_HISTORY_COLUMNS)

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: paginationResult.error.message },
        { status: paginationResult.error.statusCode },
      )
    }

    const { page, pageSize, sortBy, sortDirection } = paginationResult.data

    const limitToBack = typeFiltersRaw.length > 0 && !typeFiltersRaw.includes('Claim')
    const limitToClaim =
      (typeFiltersRaw.length > 0 && !typeFiltersRaw.includes('Back')) || rewardTokenFilters.length > 0

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
        'allocation',
        'increased',
        db.raw('NULL as amount'),
        db.raw('NULL as "rewardToken"'),
        buildAllocationAmountUsdExpression(priceParams),
      )
      .where('backer', '=', backer.toLowerCase())
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
        db.raw('NULL as allocation'),
        db.raw('NULL as increased'),
        'amount',
        'rewardToken',
        buildClaimAmountUsdExpression(priceParams),
      )
      .where('backer', '=', backer.toLowerCase())
      .modify(qb => {
        if (builderFilters.length) qb.whereIn('builder', builderFilters)
        if (rewardTokenFilters.length) qb.whereIn('rewardToken', rewardTokenFilters)
        if (limitToBack) qb.whereRaw('FALSE')
      })

    const combinedQuery = allocationHistory.union(claimedRewardsHistory).as('base')

    const orderByColumn = sortBy || 'blockTimestamp'

    const [data, countResult] = await Promise.all([
      db
        .from(combinedQuery)
        .select(
          'id',
          'type',
          'backer',
          'builder',
          'blockHash',
          'blockTimestamp',
          'transactionHash',
          'cycleStart',
          'allocation',
          'increased',
          'amount',
          'rewardToken',
          'amountUsd',
          db.raw('SUM("amountUsd") OVER (PARTITION BY "blockHash", "type") as "totalAmount"'),
        )
        .orderBy(orderByColumn, sortDirection || 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.from(combinedQuery).count<{ count: string }[]>('* as count').first(),
    ])

    const count = Number(countResult?.count || 0)

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
