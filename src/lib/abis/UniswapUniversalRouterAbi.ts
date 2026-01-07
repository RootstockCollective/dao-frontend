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
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Common Universal Router errors
  {
    inputs: [],
    name: 'TransactionDeadlinePassed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'V3InvalidAmountOut',
    type: 'error',
  },
  {
    inputs: [],
    name: 'V3InvalidSwap',
    type: 'error',
  },
  {
    inputs: [],
    name: 'V3TooLittleReceived',
    type: 'error',
  },
  {
    inputs: [],
    name: 'V3TooMuchRequested',
    type: 'error',
  },
  // Permit2 errors (Universal Router uses Permit2 for token approvals)
  {
    inputs: [{ internalType: 'uint256', name: 'deadline', type: 'uint256' }],
    name: 'AllowanceExpired',
    type: 'error',
  },
] as const
