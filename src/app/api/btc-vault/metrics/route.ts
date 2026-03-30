import { cacheLife } from 'next/cache'
import { parseEther } from 'viem'

import { rbtcVault, syntheticYield } from '@/lib/contracts'
import { publicClient } from '@/lib/viemPublicClient'

const ONE_SHARE = parseEther('1')

/**
 * Vault basis points: 1e9 = 100%.
 * SyntheticYield basis points: 10_000 = 100%.
 * Conversion: vaultBps = syntheticBps * (1e9 / 10_000) = syntheticBps * 100_000
 */
const SYNTHETIC_TO_VAULT_BPS = 100_000n

async function getCachedVaultMetricsPayload() {
  'use cache'
  cacheLife({ revalidate: 20 })

  const results = await publicClient.multicall({
    contracts: [
      { ...rbtcVault, functionName: 'totalAssets' },
      { ...rbtcVault, functionName: 'totalSupply' },
      { ...syntheticYield, functionName: 'syntheticRatePerSecond' },
      { ...syntheticYield, functionName: 'SECONDS_PER_YEAR' },
    ],
  })

  const [totalAssetsResult, totalSupplyResult, rateResult, secPerYearResult] = results

  const totalAssets = totalAssetsResult.result ?? 0n
  const totalSupply = totalSupplyResult.result ?? 0n
  const pricePerShare = totalSupply > 0n ? (totalAssets * ONE_SHARE) / totalSupply : ONE_SHARE

  let apy = 0n
  if (rateResult.result != null && secPerYearResult.result != null) {
    const syntheticApyBps = (rateResult.result * secPerYearResult.result) / 10n ** 18n
    apy = syntheticApyBps * SYNTHETIC_TO_VAULT_BPS
  }

  return {
    tvl: totalAssets.toString(),
    apy: apy.toString(),
    pricePerShare: pricePerShare.toString(),
    totalSupply: totalSupply.toString(),
    timestamp: Math.floor(Date.now() / 1000),
  }
}

export async function GET() {
  try {
    const payload = await getCachedVaultMetricsPayload()
    return Response.json(payload)
  } catch (error) {
    console.error('[btc-vault/metrics]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: `Cannot fetch vault metrics: ${message}` }, { status: 500 })
  }
}
