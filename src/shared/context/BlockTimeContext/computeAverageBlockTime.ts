const BLOCKSCOUT_STATS_URL = 'https://rootstock.blockscout.com/api/v2/stats'
const FALLBACK_BLOCK_TIME_MS = 25_000

interface BlockscoutStatsResponse {
  average_block_time: number
}

/**
 * Fetches the average Rootstock block time from the Blockscout stats API.
 * Falls back to 25s if the API is unreachable or returns unexpected data.
 *
 * @returns Average block time in milliseconds
 */
export async function computeAverageBlockTime(): Promise<number> {
  try {
    const response = await fetch(BLOCKSCOUT_STATS_URL, { signal: AbortSignal.timeout(10_000) })

    if (!response.ok) {
      console.error(`[BlockTime] Blockscout API returned ${response.status}`)
      return FALLBACK_BLOCK_TIME_MS
    }

    const data: BlockscoutStatsResponse = await response.json()
    const blockTimeMs = data.average_block_time

    if (typeof blockTimeMs !== 'number' || blockTimeMs <= 0) {
      console.error('[BlockTime] Unexpected average_block_time value:', blockTimeMs)
      return FALLBACK_BLOCK_TIME_MS
    }
    return Math.round(blockTimeMs)
  } catch (error) {
    console.error('[BlockTime] Failed to fetch block time from Blockscout:', error)
    return FALLBACK_BLOCK_TIME_MS
  }
}
