import { unstable_cache } from 'next/cache'

import {
  type EpochSettledEvent,
  fetchEpochSettledLogs,
} from '@/app/btc-vault/hooks/useDepositHistory/fetchEpochSettledLogs'

/**
 * Serialisable version of EpochSettledEvent for JSON responses.
 * bigint is not JSON-serialisable, so we convert to string.
 */
export interface EpochSettledEventDto {
  epochId: string
  reportedOffchainAssets: string
  assets: string
  supply: string
  closedAt: string
}

function toDto(event: EpochSettledEvent): EpochSettledEventDto {
  return {
    epochId: event.epochId.toString(),
    reportedOffchainAssets: event.reportedOffchainAssets.toString(),
    assets: event.assets.toString(),
    supply: event.supply.toString(),
    closedAt: event.closedAt.toString(),
  }
}

/** Named data sources. Add new sources here as they become available. */
export type EpochHistorySourceName = 'blockscout' // TODO: | 'the-graph'

interface EpochHistorySource {
  name: EpochHistorySourceName
  fetch: () => Promise<EpochSettledEventDto[]>
}

/** Blockscout source — current primary. */
async function getEpochHistoryFromBlockscout(): Promise<EpochSettledEventDto[]> {
  const events = await fetchEpochSettledLogs()
  return events.map(toDto)
}

// TODO: Add The Graph source once available
// async function getEpochHistoryFromTheGraph(): Promise<EpochSettledEventDto[]> { ... }

const sources: EpochHistorySource[] = [
  // TODO: Add { name: 'the-graph', fetch: getEpochHistoryFromTheGraph } as first source when ready
  { name: 'blockscout', fetch: getEpochHistoryFromBlockscout },
]

export interface EpochHistoryResult {
  epochs: EpochSettledEventDto[]
  source: EpochHistorySourceName | null
  errors: { source: EpochHistorySourceName; message: string }[]
}

/**
 * Fetches epoch history from available sources with fallback.
 * Tries each source in order — returns from the first one that succeeds.
 *
 * Current sources: Blockscout
 * Planned sources: The Graph → Blockscout (fallback)
 */
export async function fetchEpochHistory(): Promise<EpochHistoryResult> {
  const errors: EpochHistoryResult['errors'] = []

  for (const { name, fetch } of sources) {
    try {
      const epochs = await fetch()
      if (epochs.length > 0) {
        return { epochs, source: name, errors }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Failed to fetch epoch history from ${name}:`, message)
      errors.push({ source: name, message })
    }
  }

  return { epochs: [], source: null, errors }
}

export const getCachedEpochHistory = unstable_cache(fetchEpochHistory, ['cached_btc_vault_epoch_history'], {
  revalidate: 20,
  tags: ['cached_btc_vault_epoch_history'],
})
