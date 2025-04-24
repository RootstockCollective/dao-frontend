export const CRDeprecatedAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'removeWhitelistedBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: 'rewardReceiver_',
        type: 'address',
      },
    ],
    name: 'whitelistBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    type: 'function',
    name: 'dewhitelistBuilder',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
