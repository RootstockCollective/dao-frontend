import type { Meta, StoryObj } from '@storybook/nextjs'
import type { Address } from 'viem'

import { AnimatedGradientSurface } from '@/components/AnimatedGradientSurface'
import { SushiIcon } from '@/components/Icons'

import { ProviderCard } from './ProviderCard'
import { WalletCard } from './WalletCard'
import { WalletIdentity } from './WalletIdentity'

const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address

const meta: Meta = {
  title: 'Koto/DAO/IntroModal/Pieces',
  parameters: { layout: 'centered' },
}

export default meta

type Story = StoryObj

/**
 * Both panel pieces shown on the gradient they actually sit on, because that is the only place
 * their contrast can be judged: white text straight on this background falls to 1.3:1 where
 * the pale blob passes under it, which is why both wear the dark glass.
 */
export const OnTheGradientPanel: Story = {
  render: () => (
    <div className="flex flex-row gap-4">
      {[0, 1, 2].map(step => (
        <AnimatedGradientSurface key={step} step={step} className="w-[280px] rounded-3xl">
          <div className="flex h-[420px] flex-col justify-between gap-4 p-4">
            <WalletIdentity address={ADDRESS} />
            <WalletCard rifBalance="1250.5" rbtcBalance="0.004" needsRif={false} needsGas={false} />
          </div>
        </AnimatedGradientSurface>
      ))}
    </div>
  ),
}

/** The status line reads from both flags — it must never say "Ready" while anything is short. */
export const WalletCardStates: Story = {
  render: () => (
    <AnimatedGradientSurface className="w-[320px] rounded-3xl">
      <div className="flex flex-col gap-4 p-4">
        <WalletCard rifBalance="0" rbtcBalance="0" needsRif needsGas />
        <WalletCard rifBalance="0" rbtcBalance="0.004" needsRif needsGas={false} />
        <WalletCard rifBalance="1250.5" rbtcBalance="0.00006" needsRif={false} needsGas />
        <WalletCard rifBalance="1250.5" rbtcBalance="0.004" needsRif={false} needsGas={false} />
      </div>
    </AnimatedGradientSurface>
  ),
}

/**
 * Anchors, not buttons — middle-click, cmd-click and "copy link address" all work, and the
 * new tab is announced. Hover to check the tagline holds contrast on the hover fill.
 */
export const ProviderCards: Story = {
  render: () => (
    <div className="bg-text-80 flex w-[520px] flex-col gap-3 p-8">
      <ProviderCard
        provider={{
          name: 'Sushi',
          Icon: SushiIcon,
          tagline: 'Swap rBTC for RIF on Rootstock',
          url: 'https://www.sushi.com/rootstock/swap',
        }}
        onOpen={url => console.log('open', url)}
      />
      <ProviderCard
        provider={{
          name: 'A provider with a much longer name than usual',
          Icon: SushiIcon,
          tagline: 'And a tagline long enough to prove the row wraps instead of overflowing',
          url: 'https://example.com',
        }}
        onOpen={url => console.log('open', url)}
      />
    </div>
  ),
}

/** Renders nothing without an address, so a disconnected render cannot show an empty chip. */
export const WalletIdentityWithoutAnAddress: Story = {
  render: () => (
    <AnimatedGradientSurface className="w-[280px] rounded-3xl">
      <div className="flex flex-col gap-2 p-4">
        <WalletIdentity address={ADDRESS} />
        <WalletIdentity />
      </div>
    </AnimatedGradientSurface>
  ),
}
