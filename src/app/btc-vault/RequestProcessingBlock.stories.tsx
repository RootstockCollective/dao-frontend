import type { Meta, StoryObj } from '@storybook/nextjs'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { RequestProcessingBlock } from './components/RequestProcessingBlock'
import type { ActiveRequestDisplay } from './services/ui/types'

const meta = {
  title: 'BTC Vault/RequestProcessingBlock',
  component: RequestProcessingBlock,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className="w-full">
        <section data-testid="btc-vault-request-queue" className="w-full">
          <SectionContainer title="REQUEST PROCESSING" headerVariant="h3">
            <Story />
          </SectionContainer>
        </section>
      </div>
    ),
  ],
} satisfies Meta<typeof RequestProcessingBlock>

export default meta

type Story = StoryObj<typeof meta>

function makeRequest(overrides: Partial<ActiveRequestDisplay> = {}): ActiveRequestDisplay {
  return {
    id: 'req-1',
    type: 'deposit',
    amountFormatted: '0.5',
    status: 'pending',
    createdAtFormatted: 'Nov 14, 2023, 10:00 AM',
    claimable: false,
    lockedSharePriceFormatted: null,
    finalizeId: '1',
    epochId: '1',
    batchRedeemId: null,
    lastUpdatedFormatted: '14 Nov 2023',
    sharesFormatted: '—',
    usdEquivalentFormatted: '$12,345 USD',
    ...overrides,
  }
}

export const PendingDeposit: Story = {
  args: {
    request: makeRequest({
      type: 'deposit',
      status: 'pending',
      amountFormatted: '0.5',
      sharesFormatted: '—',
      lastUpdatedFormatted: '14 Nov 2023',
    }),
  },
}

export const ClaimableWithdrawal: Story = {
  args: {
    request: makeRequest({
      type: 'withdrawal',
      status: 'claimable',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
      lastUpdatedFormatted: '21 May 2025',
      claimable: true,
      lockedSharePriceFormatted: '1.02/share',
    }),
  },
}

export const SuccessfulDone: Story = {
  args: {
    request: makeRequest({
      type: 'deposit',
      status: 'done',
      amountFormatted: '2',
      sharesFormatted: '1.96',
      lastUpdatedFormatted: '30 May 2025',
    }),
  },
}

export const WithUsdEquivalent: Story = {
  args: {
    request: makeRequest({
      type: 'withdrawal',
      status: 'claimable',
      amountFormatted: '1.5',
      sharesFormatted: '1.5',
      usdEquivalentFormatted: '$42,000 USD',
      lastUpdatedFormatted: '21 May 2025',
    }),
  },
}

export const LargeAmount: Story = {
  args: {
    request: makeRequest({
      type: 'deposit',
      status: 'pending',
      amountFormatted: '10.75',
      sharesFormatted: '—',
      lastUpdatedFormatted: '4 Mar 2025',
    }),
  },
}

