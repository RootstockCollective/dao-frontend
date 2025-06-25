import Big from '@/lib/big'
import moment from 'moment'
import { ProposalState, ProposalCategory } from '@/shared/types'
import { Proposal } from '@/app/proposals/shared/types'

// Mock data structure based on useProposalListData return type
export const mockProposalListData: Proposal[] = [
  {
    // Base proposal data (from LatestProposalResponse)
    address: '0x1234567890123456789012345678901234567890',
    blockNumber: '0x635420',
    blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    transactionHash: '0x4ee5a774ca526d6bfecce81a007218e3d8e763e26f8271a9096f5a48426aced7',
    transactionIndex: 0x0,
    logIndex: 0,
    data: '0xba5730b79d25e25550212ad97429aac858218a47487d6fed6207edeaf937d1a60000000000000000000000001768813c5cff9b11d62d8029ee481e82b383f4980000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000635421000000000000000000000000000000000000000000000000000000000063551100000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000002217e4d3ae0a6e30075d1b5a7b8c1520e8009f490000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006444004cc100000000000000000000000019f64674d8a5b4e652319f5e239efd3bc969a1fe0000000000000000000000001768813c5cff9b11d62d8029ee481e82b383f4980000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a66b656e2072616262792070726f706f73616c2077697468207468652067726170683b6b656e2072616262792070726f706f73616c2077697468207468652067726170686b656e2072616262792070726f706f73616c2077697468207468652067726170686b656e2072616262792070726f706f73616c2077697468207468652067726170686b656e2072616262792070726f706f73616c2077697468207468652067726170680000000000000000000000000000000000000000000000000000',
    removed: false,
    topics: [],
    eventName: 'ProposalCreated',
    args: {
      proposalId: BigInt('123456789012345678901234567890'),
      proposer: '0x1234567890123456789012345678901234567890',
      targets: ['0x9876543210987654321098765432109876543210'],
      values: [0n],
      signatures: [''],
      calldatas: [
        '0x44004cc100000000000000000000000019f64674d8a5b4e652319f5e239efd3bc969a1fe0000000000000000000000001768813c5cff9b11d62d8029ee481e82b383f4980000000000000000000000000000000000000000000000000de0b6b3a7640000',
      ],
      voteStart: 6509601n,
      voteEnd: 6509841n,
      description:
        'ken rabby proposal with the graph;ken rabby proposal with the graphken rabby proposal with the graphken rabby proposal with the graphken rabby proposal with the graph',
    },

    // From getEventArguments
    name: 'Very long proposal name that goes crazy to the point that no one knows where it ends, are we there yet? Pah! grant',
    proposer: '0x1768813c5CFF9b11D62D8029Ee481E82B383f498',
    description:
      'ken rabby proposal with the graphken rabby proposal with the graphken rabby proposal with the graphken rabby proposal with Grant',
    proposalId: '84284241765167768122376040573653799057456569902673037593184518304714542535078',
    Starts: moment(1704067200000), // January 1, 2024
    calldatasParsed: [
      {
        type: 'decoded' as const,
        functionName: 'withdrawERC20',
        args: [
          '0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE',
          '0x1768813c5CFF9b11D62D8029Ee481E82B383f498',
          1000000000000000000n,
        ],
        inputs: [],
      },
    ],

    // From useProposalListData
    votes: {
      againstVotes: new Big('1000000'), // 1 token
      forVotes: new Big('5000000'), // 5 tokens
      abstainVotes: new Big('1000000'), // 0.5 tokens
      quorum: new Big('6000000'), // forVotes + abstainVotes
    },
    blocksUntilClosure: new Big('35811'),
    votingPeriod: new Big('241'), // ~7 days in blocks
    quorumAtSnapshot: new Big('60'), // 2 tokens
    proposalDeadline: new Big('6509841'),
    proposalState: ProposalState.Defeated,
    category: 'Grants',
  },
  {
    // Second mock proposal
    address: '0x2234567890123456789012345678901234567890',
    blockNumber: '12345679',
    blockHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
    transactionHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
    transactionIndex: 1,
    logIndex: 1,
    data: '0x',
    removed: false,
    topics: [],
    eventName: 'ProposalCreated',
    args: {
      proposalId: BigInt('223456789012345678901234567891'),
      proposer: '0x2234567890123456789012345678901234567890',
      targets: ['0x8876543210987654321098765432109876543210'],
      values: [BigInt('1000000000000000000')], // 1 ETH
      signatures: [''],
      calldatas: ['0x23456789'],
      voteStart: BigInt('12345671'),
      voteEnd: BigInt('12345681'),
      description: 'Funding Proposal [Grants]: Request for development funding for new features.',
    },

    name: 'Revolutionary design concept that transforms urban landscapes into sustainable paradises, but can we really achieve this?',
    proposer: '0x2234567890123456789012345678901234567890',
    description: 'Request for development funding for new features.',
    proposalId: '223456789012345678901234567891',
    Starts: moment(1704153600000), // January 2, 2024
    calldatasParsed: [
      {
        type: 'decoded' as const,
        functionName: 'withdraw' as const,
        args: ['0x8876543210987654321098765432109876543210', BigInt('1000000000000000000')],
        inputs: [],
      },
    ],

    votes: {
      againstVotes: new Big('20'), // 2 tokens
      forVotes: new Big('10'), // 8 tokens
      abstainVotes: new Big('0'), // 1 token
      quorum: new Big('10'), // forVotes + abstainVotes
    },
    blocksUntilClosure: new Big('500'),
    votingPeriod: new Big('10080'),
    quorumAtSnapshot: new Big('10'), // 3 tokens
    proposalDeadline: new Big('12345681'),
    proposalState: ProposalState.Succeeded,
    category: 'Grants' as const,
  },
  {
    // Third mock proposal - completed
    address: '0x3234567890123456789012345678901234567890',
    blockNumber: '12345677',
    blockHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    transactionHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    transactionIndex: 2,
    logIndex: 2,
    data: '0x',
    removed: false,
    topics: [],
    eventName: 'ProposalCreated',
    args: {
      proposalId: BigInt('323456789012345678901234567892'),
      proposer: '0x3234567890123456789012345678901234567890',
      targets: ['0x7876543210987654321098765432109876543210'],
      values: [BigInt(0)],
      signatures: [''],
      calldatas: ['0x34567890'],
      voteStart: BigInt('12345669'),
      voteEnd: BigInt('12345679'),
      description: 'Builder Dewhitelist [Builder]: Remove builder from whitelist due to inactivity.',
    },

    name: 'Futuristic transportation solution that promises to reduce urban congestion dramatically, but can we build the necessary infrastructure? Wave 5',
    proposer: '0x3234567890123456789012345678901234567890',
    description: 'Remove builder from whitelist due to inactivity.',
    proposalId: '323456789012345678901234567892',
    Starts: moment(1703980800000), // December 31, 2023
    calldatasParsed: [
      {
        type: 'decoded' as const,
        functionName: 'dewhitelistBuilder' as const,
        args: ['0x7876543210987654321098765432109876543210'],
        inputs: [],
      },
    ],

    votes: {
      againstVotes: new Big('2'), // 0.5 tokens
      forVotes: new Big('2'), // 12 tokens
      abstainVotes: new Big('10'), // 0.3 tokens
      quorum: new Big('12'), // forVotes + abstainVotes
    },
    blocksUntilClosure: new Big('-100'), // Already closed
    votingPeriod: new Big('10080'),
    quorumAtSnapshot: new Big('5'), // 4 tokens
    proposalDeadline: new Big('12345679'),
    proposalState: ProposalState.Executed,
    category: 'Builder' as const,
  },
]
