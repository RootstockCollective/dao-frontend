import { parseEther } from 'viem'

import { rbtcVault, syntheticYield } from '@/lib/contracts'
import { publicClient } from '@/lib/viemPublicClient'

/** Cache revalidation — roughly one RSK block time. */
export const revalidate = 20

const ONE_SHARE = parseEther('1')

/**
 * Vault basis points: 1e9 = 100%.
 * SyntheticYield basis points: 10_000 = 100%.
 * Conversion: vaultBps = syntheticBps * (1e9 / 10_000) = syntheticBps * 100_000
 */
const SYNTHETIC_TO_VAULT_BPS = 100_000n

export async function GET() {
  try {
    const results = await publicClient.multicall({
      contracts: [
        { ...rbtcVault, functionName: 'totalAssets' },
        { ...rbtcVault, functionName: 'convertToAssets', args: [ONE_SHARE] },
        { ...rbtcVault, functionName: 'totalSupply' },
        { ...syntheticYield, functionName: 'syntheticRatePerSecond' },
        { ...syntheticYield, functionName: 'SECONDS_PER_YEAR' },
      ],
    })

    const [totalAssetsResult, convertToAssetsResult, totalSupplyResult, rateResult, secPerYearResult] =
      results

    // Derive APY from SyntheticYield: apyBasisPoints = ratePerSecond * secondsPerYear / 1e18
    // Then convert to vault basis points (1e9 = 100%)
    let apy = 0n
    if (rateResult.result != null && secPerYearResult.result != null) {
      const syntheticApyBps = (rateResult.result * secPerYearResult.result) / 10n ** 18n
      apy = syntheticApyBps * SYNTHETIC_TO_VAULT_BPS
    }

    return Response.json({
      tvl: totalAssetsResult.result?.toString() ?? '0',
      apy: apy.toString(),
      pricePerShare: convertToAssetsResult.result?.toString() ?? '0',
      totalSupply: totalSupplyResult.result?.toString() ?? '0',
      timestamp: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('[btc-vault/metrics]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: `Cannot fetch vault metrics: ${message}` }, { status: 500 })
  }
}
