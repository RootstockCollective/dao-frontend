import type { Meta, StoryObj } from '@storybook/react'
import { BuilderRewards } from './BuilderRewards'
import { Address } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { AlertProvider } from '@/app/providers/AlertProvider'
import { CycleContextProvider } from '@/app/collective-rewards/metrics/context/CycleContext'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import React from 'react'
import { BuilderMetricCard } from './BuilderMetricCard'
import { ClaimRewardsButton } from './buttons/ClaimRewardsButton'
import { SeeRewardsHistoryButton } from './buttons/SeeRewardsHistoryButton'
import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  ClaimYourRewardsButton,
} from '@/app/collective-rewards/rewards'

// Mock versions of the reward components that use the same UI structure
const MockBuilderClaimableRewards: React.FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Claimable rewards"
        data-testid="ClaimableRewards"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenMetricsCardRow
        amount="1,234.56"
        fiatAmount="$2,469.12"
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim RIF rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRow>
      <TokenMetricsCardRow
        amount="0.85"
        fiatAmount="$1,700.00"
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim rBTC rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRow>
    </MetricsCard>
  )
}

const MockBuilderEstimatedRewards: React.FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Estimated rewards"
        data-testid="EstimatedRewards"
        tooltip={{
          text: (
            <>
              Your estimated rewards which will become claimable at the start of the next Cycle.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </>
          ),
          popoverProps: { size: 'medium' },
        }}
      />
      <TokenMetricsCardRow
        amount="567.89"
        fiatAmount="$1,135.78"
      />
      <TokenMetricsCardRow
        amount="0.42"
        fiatAmount="$840.00"
      />
    </MetricsCard>
  )
}

const MockBuilderLastCycleRewards: React.FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Last cycle rewards"
        data-testid="LastCycleRewards"
        tooltip={{ text: 'Your rewards from the previous cycle' }}
      />
      <TokenMetricsCardRow
        amount="890.12"
        fiatAmount="$1,780.24"
      />
      <TokenMetricsCardRow
        amount="0.65"
        fiatAmount="$1,300.00"
      />
    </MetricsCard>
  )
}

const MockBuilderAllTimeRewards: React.FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Total earned"
        data-testid="AllTimeRewards"
        tooltip={{ text: 'Your total rewards earned across all cycles' }}
      />
      <TokenMetricsCardRow
        amount="12,345.67"
        fiatAmount="$24,691.34"
      />
      <TokenMetricsCardRow
        amount="8.75"
        fiatAmount="$17,500.00"
      />
    </MetricsCard>
  )
}

const MockBuilderAllTimeShare: React.FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="All time share"
        data-testid="AllTimeShare"
        tooltip={{ text: 'Your percentage share of total rewards across all cycles' }}
      />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '8px',
        padding: '16px 0'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          15.7%
        </div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>
          of total rewards
        </div>
      </div>
    </MetricsCard>
  )
}

// Mock BuilderRewards component that uses the exact same structure as the real one
const MockBuilderRewards: React.FC<BuilderRewardDetails & { className?: string }> = ({ 
  className = '',
  builder,
  gauge,
  tokens: { rif, rbtc },
  ...rest
}) => {
  return (
    <div 
      className={`builder-rewards-container ${className}`} 
      style={{ 
        display: 'flex',
        width: '1144px',
        padding: '24px 24px 40px 24px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '40px',
        borderRadius: '4px',
        background: 'var(--Background-80, #25211E)',
      }}
    >
      {/* Builder Rewards Text */}
      <div style={{ width: '528px' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>BUILDER REWARDS</h3>
      </div>

      {/* Metrics Container */}
      <div style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
      }}>
        {/* Unclaimed */}
        <BuilderMetricCard 
          showButton
          button={
            <ClaimRewardsButton 
              onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
            />
          }
        >
          <MockBuilderClaimableRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Estimated this cycle */}
        <BuilderMetricCard>
          <MockBuilderEstimatedRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Last cycle */}
        <BuilderMetricCard>
          <MockBuilderLastCycleRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Total earned */}
        <BuilderMetricCard 
          showButton
          button={
            <SeeRewardsHistoryButton 
              onClick={() => alert('See Rewards history (placeholder - to be implemented in separate task)')}
            />
          }
        >
          <MockBuilderAllTimeRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* All time share */}
        <BuilderMetricCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <MockBuilderAllTimeShare 
              builder={builder}
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </BuilderMetricCard>
      </div>

      {/* Need to adjust backers' rewards? */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#aaa',
        fontSize: '15px',
      }}>
        <span role="img" aria-label="info">💡</span>
        Need to adjust your backers' rewards?
      </div>
    </div>
  )
}

const meta: Meta<typeof MockBuilderRewards> = {
  title: 'Builders/BuilderRewards',
  component: MockBuilderRewards,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#101010' },
        { name: 'light', value: '#fff' },
      ],
    },
    docs: {
      description: {
        component:
          'This story demonstrates the full BuilderRewards layout as per the design. All values are mocked to avoid loading states while maintaining the exact same UI components and structure.'
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })

      const config = createConfig({
        chains: [mainnet],
        transports: {
          [mainnet.id]: http(),
        },
      })

      return (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AlertProvider>
              <PricesContextProvider>
                <CycleContextProvider>
                  <Story />
                </CycleContextProvider>
              </PricesContextProvider>
            </AlertProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )
    },
  ],
}

export default meta

// Mock data for stories
const mockBuilderAddress = '0x1234567890123456789012345678901234567890' as Address
const mockGaugeAddress = '0x0987654321098765432109876543210987654321' as Address
const mockGauges = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
] as Address[]

const mockTokens = {
  rif: {
    symbol: 'RIF',
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5' as Address,
  },
  rbtc: {
    symbol: 'rBTC',
    address: '0x542fda317318ebf1d3deaf76e0b632741a7e637d' as Address,
  },
}

export const Default: StoryObj<typeof MockBuilderRewards> = {
  args: {
    builder: mockBuilderAddress,
    gauge: mockGaugeAddress,
    gauges: mockGauges,
    tokens: mockTokens,
    currency: 'USD',
  },
}

export const WithCustomClass: StoryObj<typeof MockBuilderRewards> = {
  args: {
    builder: mockBuilderAddress,
    gauge: mockGaugeAddress,
    gauges: mockGauges,
    tokens: mockTokens,
    currency: 'USD',
    className: 'p-4 bg-gray-100 rounded-lg',
  },
}
