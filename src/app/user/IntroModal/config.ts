import { currentLinks } from '@/lib/links'

// Image paths configuration
export const IMAGE_CONFIG = {
  1: {
    desktop: {
      bg: '/images/intro/rbtc-rif-bg-desktop.svg',
      squares: '/images/intro/rbtc-rif-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rbtc-rif-bg-mobile.svg',
      squares: '/images/intro/rbtc-rif-squares-mobile.svg',
    },
  },
  2: {
    desktop: {
      bg: '/images/intro/rbtc-bg-desktop.svg',
      squares: '/images/intro/rbtc-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rbtc-bg-mobile.svg',
      squares: '/images/intro/rbtc-squares-mobile.svg',
    },
  },
  3: {
    desktop: {
      bg: '/images/intro/rif-bg-desktop.svg',
      squares: '/images/intro/rif-squares-desktop.svg',
    },
    mobile: {
      bg: '/images/intro/rif-bg-mobile.svg',
      squares: '/images/intro/rif-squares-mobile.svg',
    },
  },
} as const

// Content configuration
/* eslint-disable quotes */
export const CONTENT_CONFIG = {
  1: {
    title: 'add RBTC & RIF to your wallet',
    description:
      "RIF is the token required for staking, and RBTC is used to cover transaction fees. You'll need both to participate in the DAO.",
    walletInfo: 'You need RBTC to pay fees & RIF to stake',
    showRbtc: true,
    showRif: true,
    url: currentLinks.rbtc,
  },
  2: {
    title: 'add RBTC to your wallet',
    description:
      "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
    walletInfo: 'You need RBTC for the transaction fees',
    showRbtc: true,
    showRif: false,
    url: currentLinks.rbtc,
  },
  3: {
    title: 'add RIF to your wallet',
    description:
      "RIF is the token required for staking. You'll need both RBTC and RIF to participate in the DAO.",
    walletInfo: 'You need RIF to stake',
    showRbtc: false,
    showRif: true,
    url: currentLinks.getRif,
  },
} as const

export type IntroModalStatus = keyof typeof CONTENT_CONFIG
export type IntroModalContent = (typeof CONTENT_CONFIG)[IntroModalStatus]
