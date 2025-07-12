import { currentLinks } from '@/lib/links'

// Image paths configuration
export const IMAGE_CONFIG = {
  NEED_RBTC_RIF: {
    desktop: {
      bg: '/images/intro/rbtc-rif-bg-desktop.jpg',
      pixels: '/images/intro/rbtc-rif-pixels-desktop.png',
    },
    mobile: {
      bg: '/images/intro/rbtc-rif-bg-mobile.jpg',
      pixels: '/images/intro/rbtc-rif-pixels-mobile.png',
    },
  },
  NEED_RBTC: {
    desktop: {
      bg: '/images/intro/rbtc-bg-desktop.jpg',
      pixels: '/images/intro/rbtc-pixels-desktop.png',
    },
    mobile: {
      bg: '/images/intro/rbtc-bg-mobile.jpg',
      pixels: '/images/intro/rbtc-pixels-mobile.png',
    },
  },
  NEED_RIF: {
    desktop: {
      bg: '/images/intro/rif-bg-desktop.jpg',
      pixels: '/images/intro/rif-pixels-desktop.png',
    },
    mobile: {
      bg: '/images/intro/rif-bg-mobile.jpg',
      pixels: '/images/intro/rif-pixels-mobile.png',
    },
  },
  NEED_STRIF: {
    desktop: {
      bg: '/images/intro/strif-bg-desktop.jpg',
      pixels: '/images/intro/strif-pixels-desktop.png',
    },
    mobile: {
      bg: '/images/intro/strif-bg-mobile.jpg',
      pixels: '/images/intro/strif-pixels-mobile.png',
    },
  },
} as const

// Content configuration
/* eslint-disable quotes */
export const CONTENT_CONFIG = {
  NEED_RBTC_RIF: {
    title: 'Before you stake',
    subtitle: 'add RBTC & RIF to your wallet',
    description:
      "RIF is the token required for staking, and RBTC is used to cover transaction fees. You'll need both to participate in the DAO.",
    walletInfo: 'You need RBTC to pay fees & RIF to stake',
    showRbtc: true,
    showRif: true,
    showBalance: false,
    action: {
      url: currentLinks.rbtc,
      external: true,
    },
  },
  NEED_RBTC: {
    title: 'Before you stake',
    subtitle: 'add RBTC to your wallet',
    description:
      "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
    walletInfo: 'You need RBTC for the transaction fees',
    showRbtc: true,
    showRif: false,
    showBalance: false,
    action: {
      url: currentLinks.rbtc,
      external: true,
    },
  },
  NEED_RIF: {
    title: 'Before you stake',
    subtitle: 'add RIF to your wallet',
    description:
      "RIF is the token required for staking. You'll need both RBTC and RIF to participate in the DAO.",
    walletInfo: 'You need RIF to stake',
    showRbtc: false,
    showRif: true,
    showBalance: false,
    action: {
      url: currentLinks.getRif,
      external: true,
    },
  },
  NEED_STRIF: {
    title: 'You look ready',
    subtitle: 'Stake RIF, back builders, earn rewards',
    description: 'Use RIF to stake and RBTC to pay for transactions fees.',
    walletInfo: '',
    showRbtc: false,
    showRif: false,
    showBalance: true,
    action: {
      url: '/user?action=stake',
      external: false,
    },
  },
} as const

export type IntroModalStatus = keyof typeof CONTENT_CONFIG
export type IntroModalContentProps = (typeof CONTENT_CONFIG)[IntroModalStatus]
