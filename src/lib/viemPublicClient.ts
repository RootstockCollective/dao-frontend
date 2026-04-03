import { publicActions } from 'viem'

import { config, currentEnvChain } from '@/config'

/**
 * This fetches the current client that is being used in the project to make calls such as multicall, readContract, etc...
 * Use the same chain as `createConfig` so `getClient` is never undefined when env chain id disagrees with `ENV`.
 */
const client = config.getClient({ chainId: currentEnvChain.id })

export const publicClient = client.extend(publicActions)

/**
 * This function is used to transform types to outputs allowed by the next Response.json.
 * There is a chance that result returns a bigint (usually when reading from wagmi)
 * so when next tries to JSON.stringify (under the hood) = the endpoint crashes
 * @param result
 */
function transformResultType(result: unknown) {
  switch (typeof result) {
    case 'bigint':
      return result.toString()
    case 'undefined':
      return null
    default:
      return result
  }
}

/**
 * Function that will wrap the multicall results into a plain object.
 * @param results
 */
export function transformMulticallResults<T extends Record<string, { result?: unknown }>, R>(results: T): R {
  return Object.entries(results).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: transformResultType(value.result),
    }),
    {} as R,
  )
}
