export const GaugeAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allocate',
    inputs: [
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'allocation_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'timeUntilNextCycle_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'allocationDeviation_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rewardSharesDeviation_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isNegative_',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allocationOf',
    inputs: [
      {
        name: 'backer',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'allocation',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'backerRewardPerTokenPaid',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'backersManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract BackersManagerRootstockCollective',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract BuilderRegistryRootstockCollective',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderRewards',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimBackerReward',
    inputs: [
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimBackerReward',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimBuilderReward',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimBuilderReward',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'earned',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'estimatedBackerRewards',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'incentivizeWithNative',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'incentivizeWithRifToken',
    inputs: [
      {
        name: 'amount_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'incentivizeWithUsdrifToken',
    inputs: [
      {
        name: 'amount_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'rifToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'usdrifToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'builderRegistry_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initializeV3',
    inputs: [
      {
        name: 'usdrifToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lastTimeRewardApplicable',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastUpdateTime',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'left',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'moveBuilderUnclaimedRewards',
    inputs: [
      {
        name: 'to_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'notifyRewardAmountAndUpdateShares',
    inputs: [
      {
        name: 'amountRif_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'amountUsdrif_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'backerRewardPercentage_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'periodFinish_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'cycleStart_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'cycleDuration_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'newGaugeRewardShares_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'rewardData',
    inputs: [
      {
        name: 'rifToken',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'rewardRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rewardPerTokenStored',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rewardMissing',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lastUpdateTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'builderRewards',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardMissing',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardPerToken',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardPerTokenStored',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardRate',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardShares',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewards',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rifToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalAllocation',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'usdrifToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'BackerRewardsClaimed',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'backer_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderRewardsClaimed',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NotifyReward',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'builderAmount_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'backersAmount_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardSharesUpdated',
    inputs: [
      {
        name: 'rewardShares_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'BeforeDistribution',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'GaugeHalted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      {
        name: 'balance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotAuthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotEnoughAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const
