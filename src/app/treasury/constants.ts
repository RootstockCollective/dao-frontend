export const TREASURY_TAB_DESCRIPTIONS = {
  Grants:
    'The Grants Treasury consists of funds allocated for community grants and active grant distributions. View total available funds and currently deployed grant amounts.',
  Growth:
    'The Growth Treasury is dedicated to supporting the growth of the RIF ecosystem. This includes funding for projects, initiatives, and community development.',
  General:
    'The General Treasury is used for general operational expenses and support for the RIF ecosystem. This includes funding for projects, initiatives, and community development.',
} as const

export const TREASURY_CATEGORIES = {
  Grants: ['Grants', 'Active'],
  Growth: ['Total', 'Rewards'],
  General: [''],
} as const

export const TREASURY_ASSETS = ['RIF', 'RBTC'] as const
