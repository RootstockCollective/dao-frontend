import type { Meta, StoryObj } from '@storybook/nextjs'

import type { WalletBalanceDisplay } from '../../services/ui/types'

import { WalletBalancesTable } from './WalletBalancesTable'

const meta = {
  title: 'BTC Vault/WalletBalancesTable',
  component: WalletBalancesTable,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div className="w-full max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WalletBalancesTable>

export default meta

type Story = StoryObj<typeof meta>

const mockWallet = (
  label: string,
  platform: string,
  url: string,
  amount: string,
  fiat: string,
  percent: string,
): WalletBalanceDisplay => ({
  label,
  trackingPlatform: platform,
  trackingUrl: url,
  amountFormatted: amount,
  fiatAmountFormatted: fiat,
  percentFormatted: percent,
})

const eightWallets: WalletBalanceDisplay[] = [
  mockWallet('Fordefi 1', 'Nimbus', 'https://app.nimbus.io', '999.99999', '$282.00 USD', '96.49%'),
  mockWallet('Fordefi 2', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 3', 'Suivision', 'https://suivision.xyz', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 4', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 5', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 6', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 7', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.5%'),
  mockWallet('Fordefi 8', 'Nimbus', 'https://app.nimbus.io', '9.99999', '$282.00 USD', '0.51%'),
]

export const Default: Story = {
  args: {
    wallets: eightWallets,
  },
}

export const FewWallets: Story = {
  args: {
    wallets: eightWallets.slice(0, 3),
  },
}

export const Empty: Story = {
  args: {
    wallets: [],
  },
}
