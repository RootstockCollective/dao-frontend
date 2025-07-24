import { BannerContentProps } from '@/components/StackableBanner/BannerContent'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Configuration object for a single banner notification.
 *
 * This interface defines the structure for banner configurations used in the
 * StackingNotifications component. Each banner represents a contextual notification
 * that guides users to take specific actions in the DAO.
 *
 * @example
 * ```typescript
 * const myBannerConfig: BannerConfig = {
 *   title: <span>GET <TokenImage symbol="RIF" /> RIF</span>,
 *   buttonText: 'Get RIF',
 *   description: 'RIF is required for staking in the DAO.',
 *   category: 'TOKEN',
 *   action: {
 *     url: 'https://exchange.example.com',
 *     external: true,
 *   },
 * }
 * ```
 */
export interface BannerConfig extends Omit<BannerContentProps, 'buttonOnClick'> {
  /**
   * Category used for grouping banners. The system shows at most one banner per category
   * to avoid overwhelming users. Use existing categories when possible:
   * - 'TOKEN': Token-related actions (getting tokens, staking, etc.)
   * - 'REWARDS': Reward-related notifications
   * - 'GOVERNANCE': Governance participation prompts
   * - 'STAKING': Staking-specific actions
   */
  category: string

  /**
   * Action configuration that defines what happens when the user clicks the banner button.
   */
  action: {
    /**
     * The target URL. Can be an internal route (e.g., '/user?action=stake')
     * or an external URL (e.g., 'https://exchange.example.com')
     */
    url: string | ((router?: AppRouterInstance) => void)

    /**
     * Whether this is an external link:
     * - true: Opens in a new tab/window (for external sites)
     * - false: Navigates within the same app (for internal routes)
     */
    external: boolean
  }
}

/**
 * Map of banner configuration keys to their respective BannerConfig objects.
 *
 * This type is used for the BANNER_CONFIGS constant, where each key represents
 * a unique banner type (e.g., 'NEED_RBTC', 'NEED_RIF', 'CLAIM_REWARDS').
 *
 * @example
 * ```typescript
 * const BANNER_CONFIGS: BannerConfigMap = {
 *   NEED_TOKENS: { title: "Get Tokens", ... },
 *   CLAIM_REWARDS: { title: "Claim Rewards", ... },
 * }
 * ```
 */
export type BannerConfigMap = {
  [key: string]: BannerConfig
}
