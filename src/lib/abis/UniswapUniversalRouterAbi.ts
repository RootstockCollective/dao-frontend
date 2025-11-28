/**
 * Uniswap Universal Router ABI
 * Used for executing swaps
 * Contract: 0x244f68e77357f86a8522323eBF80b5FC2F814d3E
 *
 * Note: For quotes, we use QuoterV2. This ABI is included for future swap execution.
 */
export const UniswapUniversalRouterAbi = [
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
