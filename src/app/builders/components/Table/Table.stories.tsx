import { useTableActionsContext, withTableContext } from '@/shared/context'
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { Address } from 'viem'
import { DEFAULT_HEADERS } from '.'
import { convertDataToRowData } from './BuilderDataRow'
import { Table } from './BuildersTable'
import { TokenRewards } from '@/app/collective-rewards/rewards'
import { BuilderRewardsSummary } from '@/app/collective-rewards/types'

// Mock data that exactly follows the BuildersRewards structure
const mockBuildersRewards: BuilderRewardsSummary[] = [
  {
    // RequiredBuilder properties
    address: '0x1234567890123456789012345678901234567890' as Address,
    builderName: 'Alice Builder',
    proposal: {
      id: 1n,
      name: 'Alice Proposal',
      description: 'Building amazing DeFi protocols',
      date: '2024-01-15',
    },
    stateFlags: {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x1111111111111111111111111111111111111111' as Address,
    backerRewardPct: {
      current: 500000000000000000n, // 50% = 50 * 10^16
      next: 600000000000000000n, // 60% = 60 * 10^16
      cooldownEndTime: 100n,
    },
    // BuildersRewards specific properties
    totalAllocationPercentage: 25n, // 25%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 1000000000000000000n, // 1 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 500000000000000000n, // 0.5 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 1500000000000000000n, // 1.5 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 750000000000000000n, // 0.75 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    address: '0x2345678901234567890123456789012345678901' as Address,
    builderName: 'Bob Developer',
    proposal: {
      id: 2n,
      name: 'Bob Infrastructure Project',
      description: 'Building scalable infrastructure solutions',
      date: '2024-01-20',
    },
    stateFlags: {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x2222222222222222222222222222222222222222' as Address,
    backerRewardPct: {
      current: 450000000000000000n, // 45% = 45 * 10^16
      next: 550000000000000000n, // 55% = 55 * 10^16
      cooldownEndTime: 120n,
    },
    totalAllocationPercentage: 18n, // 18%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 800000000000000000n, // 0.8 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 300000000000000000n, // 0.3 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 1200000000000000000n, // 1.2 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 600000000000000000n, // 0.6 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    address: '0x3456789012345678901234567890123456789012' as Address,
    builderName: 'Charlie Smith',
    proposal: {
      id: 3n,
      name: 'Charlie DApp Platform',
      description: 'Creating user-friendly decentralized applications',
      date: '2024-01-25',
    },
    stateFlags: {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x3333333333333333333333333333333333333333' as Address,
    backerRewardPct: {
      current: 400000000000000000n, // 40% = 40 * 10^16
      next: 500000000000000000n, // 50% = 50 * 10^16
      cooldownEndTime: 90n,
    },
    totalAllocationPercentage: 32n, // 32%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 1200000000000000000n, // 1.2 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 800000000000000000n, // 0.8 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 1800000000000000000n, // 1.8 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 900000000000000000n, // 0.9 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    // Builder that is paused
    address: '0x4567890123456789012345678901234567890123' as Address,
    builderName: 'David Paused',
    proposal: {
      id: 4n,
      name: 'David Paused Project',
      description: 'A project that has been temporarily paused',
      date: '2024-01-30',
    },
    stateFlags: {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: true, // This builder is paused
      revoked: false,
    },
    gauge: '0x4444444444444444444444444444444444444444' as Address,
    backerRewardPct: {
      current: 350000000000000000n, // 35% = 35 * 10^16
      next: 450000000000000000n, // 45% = 45 * 10^16
      cooldownEndTime: 80n,
    },
    totalAllocationPercentage: 15n, // 15%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 500000000000000000n, // 0.5 RIF
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 200000000000000000n, // 0.2 RBTC
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 0n, // No upcoming rewards (paused)
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No upcoming rewards (paused)
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    // Builder that is not activated
    address: '0x5678901234567890123456789012345678901234' as Address,
    builderName: 'Eve Inactive',
    proposal: {
      id: 5n,
      name: 'Eve Inactive Project',
      description: 'A project that is not yet activated',
      date: '2024-02-05',
    },
    stateFlags: {
      activated: false, // This builder is not activated
      communityApproved: true,
      kycApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x5555555555555555555555555555555555555555' as Address,
    backerRewardPct: {
      current: 300000000000000000n, // 30% = 30 * 10^16
      next: 400000000000000000n, // 40% = 40 * 10^16
      cooldownEndTime: 60n,
    },
    totalAllocationPercentage: 12n, // 12%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 0n, // No past rewards
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No past rewards
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 0n, // No upcoming rewards (inactive)
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No upcoming rewards (inactive)
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    // Builder that is revoked
    address: '0x6789012345678901234567890123456789012345' as Address,
    builderName: 'Frank Revoked',
    proposal: {
      id: 6n,
      name: 'Frank Revoked Project',
      description: 'A project that has been revoked',
      date: '2024-02-10',
    },
    stateFlags: {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: false,
      revoked: true, // This builder is revoked
    },
    gauge: '0x6666666666666666666666666666666666666666' as Address,
    backerRewardPct: {
      current: 250000000000000000n, // 25% = 25 * 10^16
      next: 250000000000000000n, // 25% = 25 * 10^16
      cooldownEndTime: 1700000000n,
    },
    totalAllocationPercentage: 10n, // 10%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 300000000000000000n, // 0.3 RIF (past rewards before revocation)
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 100000000000000000n, // 0.1 RBTC (past rewards before revocation)
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 0n, // No upcoming rewards (revoked)
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No upcoming rewards (revoked)
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    // Builder without community approval
    address: '0x7890123456789012345678901234567890123456' as Address,
    builderName: 'Grace Pending',
    proposal: {
      id: 7n,
      name: 'Grace Pending Project',
      description: 'A project pending community approval',
      date: '2024-02-15',
    },
    stateFlags: {
      activated: false,
      communityApproved: false, // This builder lacks community approval
      kycApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x7777777777777777777777777777777777777777' as Address,
    backerRewardPct: {
      current: 200000000000000000n, // 20% = 20 * 10^16
      next: 300000000000000000n, // 30% = 30 * 10^16
      cooldownEndTime: 40n,
    },
    totalAllocationPercentage: 8n, // 8%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 0n, // No past rewards
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No past rewards
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 0n, // No upcoming rewards
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No upcoming rewards
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
  {
    // Builder without KYC approval
    address: '0x8901234567890123456789012345678901234567' as Address,
    builderName: 'Henry NoKYC',
    proposal: {
      id: 8n,
      name: 'Henry No-KYC Project',
      description: 'A project without KYC approval',
      date: '2024-02-20',
    },
    stateFlags: {
      activated: false,
      communityApproved: true,
      kycApproved: false, // This builder lacks KYC approval
      paused: false,
      revoked: false,
    },
    gauge: '0x8888888888888888888888888888888888888888' as Address,
    backerRewardPct: {
      current: 150000000000000000n, // 15% = 15 * 10^16
      next: 250000000000000000n, // 25% = 25 * 10^16
      cooldownEndTime: 1700000000n,
    },
    totalAllocationPercentage: 6n, // 6%
    lastCycleRewards: {
      rif: {
        amount: {
          value: 0n, // No past rewards
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No past rewards
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
    builderEstimatedRewards: {
      rif: {
        amount: {
          value: 0n, // No upcoming rewards
          price: 0.06,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n, // No upcoming rewards
          price: 108000,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    } as TokenRewards,
  } as BuilderRewardsSummary,
]

// Mock user allocations for each builder - some with allocations, some without
const mockUserAllocations = [
  1000000000000000000n, // 1 RIF allocated to Alice
  500000000000000000n, // 0.5 RIF allocated to Bob
  750000000000000000n, // 0.75 RIF allocated to Charlie
  0n, // No allocation to David (paused)
  0n, // No allocation to Eve (inactive)
  250000000000000000000n, // 250 RIF allocated to Frank (revoked, but had allocation)
  0n, // No allocation to Grace (pending)
  0n, // No allocation to Henry (no KYC)
]

// Mock RIF price
const mockRifPrice = 0.06

// Helper component to set up table context with data
const TableWithData = ({
  mockData,
  userAllocations = mockUserAllocations,
  rifPrice = mockRifPrice,
  columns = DEFAULT_HEADERS,
  loading = false,
  error = null,
}: {
  mockData: BuilderRewardsSummary[]
  userAllocations?: (bigint | undefined)[]
  rifPrice?: number
  columns?: typeof DEFAULT_HEADERS
  loading?: boolean
  error?: string | null
}) => {
  const dispatch = useTableActionsContext()

  useEffect(() => {
    // Set up the table context with mock data
    dispatch({
      type: 'SET_COLUMNS',
      payload: columns,
    })

    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(
        mockData,
        userAllocations,
        { RIF: { price: rifPrice, lastUpdated: new Date().toISOString() } },
        () => {},
      ),
    })

    dispatch({
      type: 'SET_LOADING',
      payload: loading,
    })

    dispatch({
      type: 'SET_ERROR',
      payload: error,
    })
  }, [dispatch, mockData, userAllocations, rifPrice, columns, loading, error])

  return <Table />
}

const meta: Meta<typeof TableWithData> = {
  title: 'Koto/Builders/Table/Table',
  component: TableWithData,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => {
      const WrappedStory = withTableContext(Story)
      return <WrappedStory />
    },
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mockData: mockBuildersRewards,
    loading: false,
    error: null,
  },
}
