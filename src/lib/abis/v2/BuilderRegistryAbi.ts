export const BuilderRegistryAbi = [
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
    name: 'approveNewRewardReceiver',
    inputs: [
      {
        name: 'builder_',
        type: 'address',
        internalType: 'address',
      },
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
        name: 'initialized',
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
        name: 'kycPaused',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'selfPaused',
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
    name: 'canClaimBuilderReward',
    inputs: [
      {
        name: 'claimer_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'rewardReceiver_',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cancelRewardReceiverUpdate',
    inputs: [],
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
    name: 'communityBanBuilder',
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
    name: 'initialize',
    inputs: [
      {
        name: 'backersManager_',
        type: 'address',
        internalType: 'contract BackersManagerRootstockCollective',
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
    name: 'initializeBuilder',
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
    name: 'isRewardReceiverUpdatePending',
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
    name: 'pauseBuilderKYC',
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
    name: 'pauseSelf',
    inputs: [],
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
    name: 'requestRewardReceiverUpdate',
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
    name: 'requireInitializedBuilder',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
    ],
    outputs: [],
    stateMutability: 'view',
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
    name: 'rewardReceiver',
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
    name: 'rewardReceiverUpdate',
    inputs: [
      {
        name: 'builder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'update',
        type: 'address',
        internalType: 'address',
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
    name: 'setHaltedGaugeLastPeriodFinish',
    inputs: [
      {
        name: 'gauge_',
        type: 'address',
        internalType: 'contract GaugeRootstockCollective',
      },
      {
        name: 'periodFinish_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpauseBuilderKYC',
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
    name: 'unpauseSelf',
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
    name: 'BuilderInitialized',
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
    name: 'CommunityBanned',
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
    name: 'KYCPaused',
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
    name: 'KYCResumed',
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
    name: 'RewardReceiverUpdateCancelled',
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
    name: 'RewardReceiverUpdateRequested',
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
    name: 'RewardReceiverUpdated',
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
    name: 'SelfPaused',
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
    name: 'SelfResumed',
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
    name: 'BuilderAlreadyCommunityApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderAlreadyExists',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderAlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderAlreadyKYCApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderAlreadySelfPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderDoesNotExist',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotCommunityApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotKYCApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotKYCPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotOperational',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderNotSelfPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BuilderRewardsLocked',
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
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRewardReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotActivated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotAuthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
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
    name: 'ZeroAddressNotAllowed',
    inputs: [],
  },
] as const
