export const BuilderRegistryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AlreadyKYCApproved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AlreadyRevoked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AlreadyWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BuilderAlreadyExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BuilderDoesNotExist',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotRevoke',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'ERC1967InvalidImplementation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC1967NonPayable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EpochDurationNotHourBasis',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EpochDurationTooShort',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EpochDurationsAreNotMultiples',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidBuilderKickback',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IsRevoked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotGovernor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotGovernorOrAuthorizedChanger',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotKYCApproved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotOperational',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotRevoked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotWhitelisted',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UUPSUnauthorizedCallContext',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'slot',
        type: 'bytes32',
      },
    ],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rewardReceiver_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'kickback_',
        type: 'uint64',
      },
    ],
    name: 'BuilderActivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'kickback_',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cooldown_',
        type: 'uint256',
      },
    ],
    name: 'BuilderKickbackUpdateScheduled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'Dewhitelisted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'gauge_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'creator_',
        type: 'address',
      },
    ],
    name: 'GaugeCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'KYCApproved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'KYCRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newEpochDuration_',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cooldownEndTime_',
        type: 'uint256',
      },
    ],
    name: 'NewEpochDurationScheduled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes20',
        name: 'reason_',
        type: 'bytes20',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'kickback_',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cooldown_',
        type: 'uint256',
      },
    ],
    name: 'Permitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'Revoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'Whitelisted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
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
        internalType: 'address',
        name: 'rewardReceiver_',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: 'kickback_',
        type: 'uint64',
      },
    ],
    name: 'activateBuilder',
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
    ],
    name: 'approveBuilderKYC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder',
        type: 'address',
      },
    ],
    name: 'builderKickback',
    outputs: [
      {
        internalType: 'uint64',
        name: 'previous',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'next',
        type: 'uint64',
      },
      {
        internalType: 'uint128',
        name: 'cooldownEndTime',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder',
        type: 'address',
      },
    ],
    name: 'builderRewardReceiver',
    outputs: [
      {
        internalType: 'address',
        name: 'rewardReceiver',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder',
        type: 'address',
      },
    ],
    name: 'builderState',
    outputs: [
      {
        internalType: 'bool',
        name: 'kycApproved',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'whitelisted',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'paused',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'revoked',
        type: 'bool',
      },
      {
        internalType: 'bytes8',
        name: 'reserved',
        type: 'bytes8',
      },
      {
        internalType: 'bytes20',
        name: 'pausedReason',
        type: 'bytes20',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder',
        type: 'address',
      },
    ],
    name: 'builderToGauge',
    outputs: [
      {
        internalType: 'contract Gauge',
        name: 'gauge',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'changeExecutor',
    outputs: [
      {
        internalType: 'contract IChangeExecutorRootstockCollective',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'dewhitelistBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp_',
        type: 'uint256',
      },
    ],
    name: 'endDistributionWindow',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'epochData',
    outputs: [
      {
        internalType: 'uint32',
        name: 'previousDuration',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'nextDuration',
        type: 'uint32',
      },
      {
        internalType: 'uint64',
        name: 'previousStart',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'nextStart',
        type: 'uint64',
      },
      {
        internalType: 'uint24',
        name: 'offset',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp_',
        type: 'uint256',
      },
    ],
    name: 'epochNext',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp_',
        type: 'uint256',
      },
    ],
    name: 'epochStart',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gaugeFactory',
    outputs: [
      {
        internalType: 'contract GaugeFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Gauge',
        name: 'gauge',
        type: 'address',
      },
    ],
    name: 'gaugeToBuilder',
    outputs: [
      {
        internalType: 'address',
        name: 'builder',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getEpochStartAndDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index_',
        type: 'uint256',
      },
    ],
    name: 'getGaugeAt',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGaugesLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index_',
        type: 'uint256',
      },
    ],
    name: 'getHaltedGaugeAt',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHaltedGaugesLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'getKickbackToApply',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governor',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Gauge',
        name: 'gauge',
        type: 'address',
      },
    ],
    name: 'haltedGaugeLastPeriodFinish',
    outputs: [
      {
        internalType: 'uint256',
        name: 'lastPeriodFinish',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'isBuilderOperational',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'isBuilderPaused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'gauge_',
        type: 'address',
      },
    ],
    name: 'isGaugeHalted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Gauge',
        name: 'gauge_',
        type: 'address',
      },
    ],
    name: 'isGaugeOperational',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'gauge_',
        type: 'address',
      },
    ],
    name: 'isGaugeRewarded',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'kickbackCooldown',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
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
        internalType: 'bytes20',
        name: 'reason_',
        type: 'bytes20',
      },
    ],
    name: 'pauseBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'kickback_',
        type: 'uint64',
      },
    ],
    name: 'permitBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'revokeBuilder',
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
    ],
    name: 'revokeBuilderKYC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardDistributor',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'kickback_',
        type: 'uint64',
      },
    ],
    name: 'setBuilderKickback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'newEpochDuration_',
        type: 'uint32',
      },
      {
        internalType: 'uint24',
        name: 'epochStartOffset_',
        type: 'uint24',
      },
    ],
    name: 'setEpochDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp_',
        type: 'uint256',
      },
    ],
    name: 'timeUntilNextEpoch',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
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
    ],
    name: 'unpauseBuilder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'builder_',
        type: 'address',
      },
    ],
    name: 'whitelistBuilder',
    outputs: [
      {
        internalType: 'contract Gauge',
        name: 'gauge_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
