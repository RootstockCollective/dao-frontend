import { NEED_RBTC, NEED_RIF, NEED_STRIF, NEED_RBTC_RIF } from '@/app/user/IntroModal/hooks/useRequiredTokens'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'
import { BannerConfigMap } from './types'

// Static token images - created once outside component to avoid re-renders
const rbtcImage = <TokenImage symbol={RBTC} size={26} className="inline-block mt-[-0.2rem]" />
const rifImage = <TokenImage symbol={RIF} size={24} className="inline-block mt-[-0.2rem]" />

export const NOT_BACKING = 'NOT_BACKING'
export const KYC_ONLY = 'KYC_ONLY'
export const START_BUILDING = 'START_BUILDING'
export const CYCLE_ENDING = 'CYCLE_ENDING'
export const CYCLE_ENDED = 'CYCLE_ENDED'

const NEED_RBTC_AND_RIF = {
  title: <span>GET {rbtcImage} rBTC</span>,
  buttonText: 'Get rBTC',
  description:
    "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
  action: {
    url: currentLinks.rbtc,
    external: true,
  },
}

/**
 * BANNER CONFIGURATION REGISTRY
 * =============================
 *
 * This object maps banner keys to their display configuration. Each banner config
 * defines how a notification should appear and behave when shown to users.
 *
 * TO ADD A NEW BANNER CONFIG:
 *
 * 1. Choose a unique key (e.g., 'CLAIM_REWARDS', 'VOTE_PROPOSAL')
 * 2. Define the configuration following this pattern:
 *
 * ```typescript
 * YOUR_BANNER_KEY: {
 *   title: <span>Your Banner Title</span>,              // Can include JSX/icons
 *   buttonText: 'Action Button Text',                   // Clear call-to-action
 *   description: 'Helpful explanation for the user.',   // Context about the action
 *   category: 'YOUR_CATEGORY',                          // For grouping (see below)
 *   action: {
 *     url: '/your-route-or-external-url',               // Target destination
 *     external: false,                                  // true = new tab, false = same tab
 *   },
 * },
 * ```
 *
 * CATEGORY GUIDELINES:
 * - 'TOKEN': Token-related actions (getting tokens, staking, etc.)
 * - 'REWARDS': Reward claiming and reward-related actions
 * - Create new categories only for fundamentally different action types
 *
 * EXAMPLES OF GOOD BANNER CONFIGS:
 * - Clear, actionable titles with visual elements (icons, token images)
 * - Descriptive but concise explanations
 * - Strong call-to-action button text
 * - Appropriate categorization
 */
export const BANNER_CONFIGS: BannerConfigMap = {
  [NEED_RBTC]: NEED_RBTC_AND_RIF,
  [NEED_RBTC_RIF]: NEED_RBTC_AND_RIF,
  [NEED_RIF]: {
    title: <span>GET {rifImage} RIF</span>,
    buttonText: 'Get RIF',
    description:
      "RIF is the token required for staking. You'll need both RBTC and RIF to participate in the DAO.",
    action: {
      url: currentLinks.getRif,
      external: true,
    },
  },
  [NEED_STRIF]: {
    title: <span>STAKE {rifImage} RIF</span>,
    buttonText: 'Stake RIF',
    description: 'Use RIF to stake and RBTC to pay for transactions fees.',
    action: {
      url: router => router?.push(`/user?action=stake&reopen=${Date.now()}`),
      external: false,
    },
  },
  [NOT_BACKING]: {
    title: <span>BACK</span>,
    buttonText: 'See all Builders',
    description: 'Back Builders to start earning rewards.',
    action: {
      url: '/builders',
      external: false,
    },
  },
  [KYC_ONLY]: {
    title: <span>TAKE THE NEXT STEP</span>,
    buttonText: 'Create Proposal',
    description:
      'Your application to join Collective Rewards is nearly there. Create your proposal to complete your activation.',
    action: {
      url: '/proposals',
      external: false,
    },
  },
  [START_BUILDING]: {
    title: <span>START BUILDING</span>,
    buttonText: 'See all Builders',
    description:
      'You’re now a Collective Builder. Keep building and see your presence among the Collective Builders.',
    action: {
      url: '/builders',
      external: false,
    },
  },
  [CYCLE_ENDING]: {
    title: <span>NEW CYCLE STARTING SOON</span>,
    buttonText: 'Back Builders',
    description: 'Adjust your backing to make the most of the upcoming rewards.',
    // rightContent will be managed dynamically as it depends on the cycle data
    rightContent: undefined,
    action: {
      url: '/backing',
      external: false,
    },
  },
  [CYCLE_ENDED]: {
    title: <span>CYCLE JUST ENDED</span>,
    buttonText: 'Claim Rewards',
    description:
      'The cycle has ended. Claim your rewards and re-stake them to earn more rewards in the next cycle.',
    action: {
      url: '/my-rewards',
      external: false,
    },
  },
  /*
   * ADD YOUR NEW BANNER CONFIGS HERE
   * ================================
   *
   * Example - Rewards Banner:
   * CLAIM_REWARDS: {
   *   title: <span>🎁 Claim Your Rewards</span>,
   *   buttonText: 'Claim Now',
   *   description: 'You have unclaimed rewards available. Claim them now to earn your tokens.',
   *   category: 'REWARDS',
   *   action: {
   *     url: '/rewards?action=claim',
   *     external: false,
   *   },
   * },
   *
   * Example - Governance Banner:
   * ACTIVE_PROPOSAL: {
   *   title: <span>📊 Active Proposal</span>,
   *   buttonText: 'Vote Now',
   *   description: 'There is an active proposal that needs your vote. Participate in governance.',
   *   category: 'GOVERNANCE',
   *   action: {
   *     url: '/proposals',
   *     external: false,
   *   },
   * },
   */
}
