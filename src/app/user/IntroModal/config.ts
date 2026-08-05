import type { ComponentType } from 'react'

import { BinanceIcon, OkuIcon, SushiIcon, SymbiosisIcon } from '@/components/Icons'
import { currentLinks } from '@/lib/links'

import { INTRO_STEP_GAS, INTRO_STEP_RIF, INTRO_STEP_SUMMARY, type IntroStepId } from './hooks/useIntroSteps'

export interface ProviderLink {
  name: string
  /** The provider's brand mark, already badged in its own colours. */
  Icon: ComponentType<{ size?: number; className?: string }>
  /** What the user will actually do there. Differs per step, so it belongs here, not on the provider. */
  tagline: string
  url: string
}

interface IntroStepContent {
  /** Small line above the title, e.g. "BEFORE YOU STAKE". */
  eyebrow: string
  title: string
  description: string
  /** Places to go for this step. Opening one keeps the modal open, on purpose. */
  providers: ProviderLink[]
  /**
   * Shown instead of `description` once every requirement is met. The summary step is
   * reachable in that state — a user who holds RIF and gas but has never staked sees it as
   * their only step — and telling them to wait for funds that already landed is simply false.
   */
  descriptionWhenReady?: string
}

export const STEP_CONTENT: Record<IntroStepId, IntroStepContent> = {
  [INTRO_STEP_RIF]: {
    eyebrow: 'Before you stake',
    title: 'Add RIF to your wallet',
    description: 'Swap or buy RIF on one of these. They open in a new tab.',
    providers: [
      {
        name: 'Sushi',
        Icon: SushiIcon,
        tagline: 'Swap rBTC for RIF on Rootstock',
        url: currentLinks.getRifSushi,
      },
      {
        name: 'Symbiosis',
        Icon: SymbiosisIcon,
        tagline: 'Cross-chain swap into RIF',
        url: currentLinks.getRifSymbiosis,
      },
      {
        name: 'OKU',
        Icon: OkuIcon,
        tagline: 'Bridge ETH into RIF on Rootstock',
        url: currentLinks.getRifOku,
      },
      {
        name: 'Binance',
        Icon: BinanceIcon,
        tagline: 'Buy RIF, then withdraw to Rootstock',
        url: currentLinks.getRifBinance,
      },
    ],
  },
  [INTRO_STEP_GAS]: {
    eyebrow: 'Next up',
    title: 'Get rBTC for gas',
    description: 'Every transaction on Rootstock is paid in rBTC. A small amount is enough.',
    providers: [
      // ETH only. Oku's Rootstock bridge providers are EVM-only, so it cannot take BTC —
      // Symbiosis covers that path below.
      { name: 'OKU', Icon: OkuIcon, tagline: 'Bridge ETH into rBTC', url: currentLinks.getRbtcOku },
      {
        name: 'Symbiosis',
        Icon: SymbiosisIcon,
        tagline: 'Swap BTC into rBTC on Rootstock',
        url: currentLinks.getRbtcSymbiosisFromBtc,
      },
    ],
  },
  [INTRO_STEP_SUMMARY]: {
    eyebrow: 'Last step',
    title: 'Ready to stake',
    description: 'You can stake as soon as both land. Nothing happens until you confirm.',
    descriptionWhenReady: 'Everything is in place. Choose how much RIF to stake on the next screen.',
    providers: [],
  },
}
