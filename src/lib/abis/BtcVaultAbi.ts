/**
 * ABI fragment for BTC Vault contract (ERC-7540 async vault).
 *
 * Only includes functions used by the frontend. The `requestDeposit` function
 * is payable — rBTC is sent as `msg.value` (native currency, no ERC-20 approve needed).
 * The `requestRedeem` function is non-payable — vault tokens are ERC-20.
 *
 * TODO: verify exact ABI against deployed contract before mainnet launch.
 */
export const BtcVaultAbi = [
  {
    type: 'function',
    name: 'requestDeposit',
    inputs: [
      { name: 'assets', type: 'uint256', internalType: 'uint256' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'minSharesOut', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'requestId', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'requestRedeem',
    inputs: [
      { name: 'shares', type: 'uint256', internalType: 'uint256' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'minAssetsOut', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'requestId', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const
