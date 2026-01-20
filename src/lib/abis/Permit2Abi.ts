/**
 * Permit2 ABI
 * Used for checking and setting allowances for Universal Router
 * Contract: 0x000000000022D473030F116dDEE9F6B43aC78BA3 (same on all chains via CREATE2)
 * Rootstock: 0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5
 *
 * Supports two approval modes:
 * 1. On-chain: approve() - requires 2 transactions (ERC-20 approve + Permit2 approve)
 * 2. Signature-based: permit() - requires 1 signature + 1 transaction (bundled with swap)
 */
export const Permit2Abi = [
  // allowance() - Read current allowance for user/token/spender
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
      { internalType: 'uint48', name: 'nonce', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // approve() - On-chain approval (requires 2 tx: ERC-20 approve + Permit2 approve)
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // permit() - Signature-based approval (1 signature, bundled with swap tx)
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint160', name: 'amount', type: 'uint160' },
              { internalType: 'uint48', name: 'expiration', type: 'uint48' },
              { internalType: 'uint48', name: 'nonce', type: 'uint48' },
            ],
            internalType: 'struct IAllowanceTransfer.PermitDetails',
            name: 'details',
            type: 'tuple',
          },
          { internalType: 'address', name: 'spender', type: 'address' },
          { internalType: 'uint256', name: 'sigDeadline', type: 'uint256' },
        ],
        internalType: 'struct IAllowanceTransfer.PermitSingle',
        name: 'permitSingle',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Errors
  {
    inputs: [{ internalType: 'uint256', name: 'deadline', type: 'uint256' }],
    name: 'SignatureExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidNonce',
    type: 'error',
  },
] as const
