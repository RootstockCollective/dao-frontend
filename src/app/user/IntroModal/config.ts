import { currentLinks } from '@/lib/links'

// Image paths configuration
export const IMAGE_CONFIG = {
  NEED_RBTC_RIF: {
    desktop: {
      bg: '/images/intro/rbtc-rif-bg-desktop.svg',
      squares: '/images/intro/rbtc-rif-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rbtc-rif-bg-mobile.svg',
      squares: '/images/intro/rbtc-rif-squares-mobile.svg',
    },
  },
  NEED_RBTC: {
    desktop: {
      bg: '/images/intro/rbtc-bg-desktop.svg',
      squares: '/images/intro/rbtc-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rbtc-bg-mobile.svg',
      squares: '/images/intro/rbtc-squares-mobile.svg',
    },
  },
  NEED_RIF: {
    desktop: {
      bg: '/images/intro/rif-bg-desktop.svg',
      squares: '/images/intro/rif-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rif-bg-mobile.svg',
      squares: '/images/intro/rif-squares-mobile.svg',
    },
  },
  NEED_STRIF: {
    desktop: {
      bg: '/images/intro/strif-bg-desktop.svg',
      squares: '/images/intro/strif-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/strif-bg-mobile.svg',
      squares: '/images/intro/strif-squares-mobile.svg',
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
