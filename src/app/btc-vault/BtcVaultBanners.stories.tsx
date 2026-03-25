import type { Meta, StoryObj } from '@storybook/nextjs'
import type React from 'react'
import { fn } from 'storybook/test'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'

import { DepositWindowSection } from './components/DepositWindowSection'
import { DisclosureContent } from './components/DisclosureContent'
import { EligibilityBannerContent } from './components/EligibilityBannerContent'
import { PauseBannerContent } from './components/PauseBannerContent'
import type { EpochDisplay } from './services/ui/types'

const PAUSE_BANNER_GRADIENT = 'linear-gradient(270deg, #64280C 0%, #DD9E52 33.69%, #FFF5E1 52.83%)'
const BTC_VAULT_GRADIENT = 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)'

const openEpoch: EpochDisplay = {
  epochId: '3',
  status: 'open',
  statusSummary: 'Closes in 5d',
  isAcceptingRequests: true,
  endTime: Math.floor(Date.now() / 1000) + 86400 * 5,
  closesAtFormatted: '29 Mar 2026',
}

const meta = {
  title: 'BTC Vault/BtcVaultBanners',
  component: StackableBanner,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div className="mx-auto mt-12 max-w-[960px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StackableBanner>

export default meta
type Story = StoryObj<typeof meta>

/** Disconnected user: disclosure only (epoch closed). */
export const DisconnectedClosed: Story = {
  name: 'Disconnected — Disclosure only',
  args: {
    testId: 'DisclosureBanner',
    children: (
      <div className="flex flex-col gap-4">
        <h3 className="text-v3-text-0 font-bold uppercase text-lg tracking-[0.4px]">DISCLOSURE</h3>
        <DisclosureContent variant="banner" />
      </div>
    ),
  },
}

/** Disconnected user: deposit window + disclosure (epoch open). */
export const DisconnectedOpen: Story = {
  name: 'Disconnected — Deposit window + Disclosure',
  args: {
    testId: 'DisclosureBanner',
    children: [
      <DepositWindowSection key="deposit-window" epoch={openEpoch} />,
      <div key="disclosure" className="flex flex-col gap-4">
        <h3 className="text-v3-text-0 font-bold uppercase text-lg tracking-[0.4px]">DISCLOSURE</h3>
        <DisclosureContent variant="banner" />
      </div>,
    ],
  },
}

/** Connected: KYB not submitted. */
export const EligibilityNone: Story = {
  name: 'Connected — KYB not submitted',
  args: {
    children: <EligibilityBannerContent variant="none" onSubmitKyb={fn()} onCheckStatus={fn()} />,
  },
}

/** Connected: KYB rejected. */
export const EligibilityRejected: Story = {
  name: 'Connected — KYB rejected',
  args: {
    children: (
      <EligibilityBannerContent
        variant="rejected"
        rejectionReason="Document verification could not be completed"
        onSubmitKyb={fn()}
        onCheckStatus={fn()}
      />
    ),
  },
}

/** Connected: deposits paused. */
export const DepositsPaused: Story = {
  name: 'Connected — Deposits paused',
  args: {
    background: PAUSE_BANNER_GRADIENT,
    mobileBackground: PAUSE_BANNER_GRADIENT,
    decorativeImageColor: '#FFF5E1',
    decorativeSecondaryColor: '#171412',
    testId: 'PauseBanner',
    children: <PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'active' }} />,
  },
}

/** Connected: withdrawals paused. */
export const WithdrawalsPaused: Story = {
  name: 'Connected — Withdrawals paused',
  args: {
    background: PAUSE_BANNER_GRADIENT,
    mobileBackground: PAUSE_BANNER_GRADIENT,
    decorativeImageColor: '#FFF5E1',
    decorativeSecondaryColor: '#171412',
    testId: 'PauseBanner',
    children: <PauseBannerContent pauseState={{ deposits: 'active', withdrawals: 'paused' }} />,
  },
}

/** Connected: both deposits and withdrawals paused. */
export const BothPaused: Story = {
  name: 'Connected — Both paused',
  args: {
    background: PAUSE_BANNER_GRADIENT,
    mobileBackground: PAUSE_BANNER_GRADIENT,
    decorativeImageColor: '#FFF5E1',
    decorativeSecondaryColor: '#171412',
    testId: 'PauseBanner',
    children: <PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'paused' }} />,
  },
}

/** Connected: pause banner stacked above eligibility (KYB not submitted). */
export const PausedWithEligibility: Story = {
  name: 'Connected — Paused + KYB not submitted',
  args: { children: null as unknown as React.ReactNode },
  render: () => (
    <div className="flex flex-col">
      <StackableBanner
        testId="PauseBanner"
        background={PAUSE_BANNER_GRADIENT}
        mobileBackground={PAUSE_BANNER_GRADIENT}
        decorativeImageColor="#FFF5E1"
        decorativeSecondaryColor="#171412"
      >
        <PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'paused' }} />
      </StackableBanner>
      <StackableBanner background={BTC_VAULT_GRADIENT}>
        <EligibilityBannerContent variant="none" onSubmitKyb={fn()} onCheckStatus={fn()} />
      </StackableBanner>
    </div>
  ),
}

/** Connected: pause banner stacked above deposit window + disclosure. */
export const PausedWithDepositWindow: Story = {
  name: 'Connected — Paused + Deposit window',
  args: { children: null as unknown as React.ReactNode },
  render: () => (
    <div className="flex flex-col">
      <StackableBanner
        testId="PauseBanner"
        background={PAUSE_BANNER_GRADIENT}
        mobileBackground={PAUSE_BANNER_GRADIENT}
        decorativeImageColor="#FFF5E1"
        decorativeSecondaryColor="#171412"
      >
        <PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'active' }} />
      </StackableBanner>
      <StackableBanner>
        {[
          <DepositWindowSection key="deposit-window" epoch={openEpoch} />,
          <div key="disclosure" className="flex flex-col gap-4">
            <h3 className="text-v3-text-0 font-bold uppercase text-lg tracking-[0.4px]">DISCLOSURE</h3>
            <DisclosureContent variant="banner" />
          </div>,
        ]}
      </StackableBanner>
    </div>
  ),
}
