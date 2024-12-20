export const BackersManagerAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'UPGRADE_INTERFACE_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'activateBuilder',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardReceiver_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardPercentage_',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allocate',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
      {
        name: 'allocation_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allocateBatch',
    inputs: [
      {
        name: 'gauges_',
        type: 'address[]',
        internalType: 'contract GaugeRootstockCollective[]',
      },
      {
        name: 'allocations_',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveBuidlerRewardReceiverReplacement',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardReceiverReplacement_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveBuilderKYC',
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
  {
    type: 'function',
    name: 'backerRewardPercentage',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'previous',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'next',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'cooldownEndTime',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'backerTotalAllocation',
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
    name: 'builderRewardReceiver',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'rewardReceiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderRewardReceiverReplacement',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'rewardReceiverReplacement',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderState',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'activated',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'kycApproved',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'communityApproved',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'paused',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'revoked',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'reserved',
        type: 'bytes7',
        internalType: 'bytes7',
      },
      {
        name: 'pausedReason',
        type: 'bytes20',
        internalType: 'bytes20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'builderToGauge',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'gauge',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'canWithdraw',
    inputs: [
      {
        name: 'targetAddress_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cancelRewardReceiverReplacementRequest',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimBackerRewards',
    inputs: [
      {
        name: 'gauges_',
        type: 'address[]',
        internalType: 'contract GaugeRootstockCollective[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimBackerRewards',
    inputs: [
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'gauges_',
        type: 'address[]',
        internalType: 'contract GaugeRootstockCollective[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'communityApproveBuilder',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cycleData',
    inputs: [],
    outputs: [
      {
        name: 'previousDuration',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'nextDuration',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'previousStart',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'nextStart',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'offset',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cycleNext',
    inputs: [
      {
        name: 'timestamp_',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'cycleStart',
    inputs: [
      {
        name: 'timestamp_',
        type: 'uint256',
        internalType: 'uint256',
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
  {
    type: 'function',
    name: 'distribute',
    inputs: [],
    outputs: [
      {
        name: 'finished_',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'distributionDuration',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'endDistributionWindow',
    inputs: [
      {
        name: 'timestamp_',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'gaugeFactory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract GaugeFactoryRootstockCollective',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'gaugeToBuilder',
    inputs: [
      {
        name: 'gauge',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    outputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCycleStartAndDuration',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
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
    name: 'getGaugeAt',
    inputs: [
      {
        name: 'index_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'getGaugesLength',
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
    name: 'getHaltedGaugeAt',
    inputs: [
      {
        name: 'index_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'getHaltedGaugesLength',
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
    name: 'getRewardPercentageToApply',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'governanceManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IGovernanceManagerRootstockCollective',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'haltedGaugeLastPeriodFinish',
    inputs: [
      {
        name: 'gauge',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    outputs: [
      {
        name: 'lastPeriodFinish',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasBuilderRewardReceiverPendingApproval',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'indexLastGaugeDistributed',
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
    name: 'initialize',
    inputs: [
      {
        name: 'governanceManager_',
        type: 'address',
        internalType: 'contract IGovernanceManagerRootstockCollective',
      },
      {
        name: 'rewardToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'stakingToken_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'gaugeFactory_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardDistributor_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'cycleDuration_',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'cycleStartOffset_',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: 'distributionDuration_',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'rewardPercentageCooldown_',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isBuilderOperational',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isBuilderPaused',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isGaugeHalted',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isGaugeOperational',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isGaugeRewarded',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'migrateBuilder',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardAddress_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rewardPercentage_',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'notifyRewardAmount',
    inputs: [
      {
        name: 'amount_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'onDistributionPeriod',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pauseBuilder',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'reason_',
        type: 'bytes20',
        internalType: 'bytes20',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'periodFinish',
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
    name: 'permitBuilder',
    inputs: [
      {
        name: 'rewardPercentage_',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'revokeBuilder',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeBuilderKYC',
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
  {
    type: 'function',
    name: 'rewardDistributor',
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
    name: 'rewardPercentageCooldown',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardToken',
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
    name: 'rewardsCoinbase',
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
    name: 'rewardsERC20',
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
    name: 'setBackerRewardPercentage',
    inputs: [
      {
        name: 'rewardPercentage_',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setCycleDuration',
    inputs: [
      {
        name: 'newCycleDuration_',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'cycleStartOffset_',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setDistributionDuration',
    inputs: [
      {
        name: 'newDistributionDuration_',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakingToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'startDistribution',
    inputs: [],
    outputs: [
      {
        name: 'finished_',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitRewardReceiverReplacementRequest',
    inputs: [
      {
        name: 'newRewardReceiver_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId_',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tempTotalPotentialReward',
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
    name: 'timeUntilNextCycle',
    inputs: [
      {
        name: 'timestamp_',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'totalPotentialReward',
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
    name: 'unpauseBuilder',
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
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'BackerRewardPercentageUpdateScheduled',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rewardPercentage_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'cooldown_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderActivated',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rewardReceiver_',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'rewardPercentage_',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderMigrated',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'migrator_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderRewardReceiverReplacementApproved',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newRewardReceiver_',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderRewardReceiverReplacementCancelled',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newRewardReceiver_',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BuilderRewardReceiverReplacementRequested',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newRewardReceiver_',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CommunityApproved',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Dewhitelisted',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GaugeCreated',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'gauge_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'creator_',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
    name: 'KYCApproved',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'KYCRevoked',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewAllocation',
    inputs: [
      {
        name: 'backer_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'gauge_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'allocation_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewCycleDurationScheduled',
    inputs: [
      {
        name: 'newCycleDuration_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'cooldownEndTime_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewDistributionDuration',
    inputs: [
      {
        name: 'newDistributionDuration_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'by_',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
        name: 'sender_',
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
    name: 'Paused',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'reason_',
        type: 'bytes20',
        indexed: false,
        internalType: 'bytes20',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Permitted',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rewardPercentage_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'cooldown_',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Revoked',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardDistributed',
    inputs: [
      {
        name: 'sender_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardDistributionFinished',
    inputs: [
      {
        name: 'sender_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardDistributionStarted',
    inputs: [
      {
        name: 'sender_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'AddressInsufficientBalance',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'AlreadyActivated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyCommunityApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyKYCApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyRevoked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BeforeDistribution',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderAlreadyExists',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderDoesNotExist',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CycleDurationTooShort',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DistributionDurationTooLong',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DistributionDurationTooShort',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DistributionModifiedDuringDistributionWindow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DistributionPeriodDidNotStart',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ERC1967InvalidImplementation',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967NonPayable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedInnerCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'GaugeDoesNotExist',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBackerRewardPercentage',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBuilderRewardReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoGaugesForDistribution',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotActivated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotCommunityApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotEnoughStaking',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInDistributionPeriod',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotKYCApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotOperational',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotRevoked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotValidChangerOrFoundation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OnlyInDistributionWindow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PositiveAllocationOnHaltedGauge',
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
  {
    type: 'error',
    name: 'UUPSUnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnsupportedProxiableUUID',
    inputs: [
      {
        name: 'slot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'UnequalLengths',
    inputs: [],
  },
] as const
