import { useRequiredTokens } from '@/app/user/IntroModal/hooks/useRequiredTokens'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { handleActionClick } from './utils'
import { BannerConfig } from './types'
import { useRouter } from 'next/navigation'
import { BANNER_CONFIGS } from './constants'

/*
 * =====================================================================================
 * STACKING NOTIFICATIONS COMPONENT - DEVELOPER GUIDE
 * =====================================================================================
 *
 * This component displays contextual banner notifications to guide users through
 * various actions in the DAO. The system is designed to be modular and extensible.
 *
 * QUICK START - Adding a New Banner:
 * 1. Add your banner config to BANNER_CONFIGS below
 * 2. Create a detection function (see examples below)
 * 3. Add your detection to the activeBannerConfigs array
 * 4. Add any async dependencies to the dependencies array
 *
 * ARCHITECTURE OVERVIEW:
 * - BANNER_CONFIGS: Static configuration mapping banner types to display properties
 * - Detection Functions: Determine when banners should be shown based on user state
 * - Category System: Groups banners to avoid overwhelming users (max 1 per category)
 * - Action Handling: Unified system for handling banner button clicks
 *
 * =====================================================================================
 */

/**
 * Groups banner configs by category and randomly selects one from each category.
 * This ensures we display at most one banner per category to avoid overwhelming the user.
 *
 * @param bannerConfigs - Array of banner configurations to process
 * @returns Array of banner configs with at most one per category, randomly selected
 *
 * @example
 * // If you have 3 TOKEN banners and 2 REWARDS banners, this will return
 * // 2 banners total (1 random TOKEN + 1 random REWARDS)
 */
const selectBannerConfigsByCategory = (bannerConfigs: BannerConfig[]): BannerConfig[] => {
  // Dynamically group by categories that actually exist in the configs
  const configsByCategory: Record<string, BannerConfig[]> = {}

  bannerConfigs.forEach(config => {
    if (!configsByCategory[config.category]) {
      configsByCategory[config.category] = []
    }
    configsByCategory[config.category].push(config)
  })

  const selectedConfigs: BannerConfig[] = []

  // Randomly select one banner config from each category
  Object.entries(configsByCategory).forEach(([_, categoryConfigs]) => {
    if (categoryConfigs.length > 0) {
      // Randomly pick one banner config from this category
      const randomIndex = Math.floor(Math.random() * categoryConfigs.length)
      selectedConfigs.push(categoryConfigs[randomIndex])
    }
  })

  return selectedConfigs
}

/**
 * Maps a missing token type to its corresponding banner configuration.
 * Returns null if no token is missing or if no banner config exists for the token type.
 *
 * @param missingTokenType - The type of token the user is missing (NEED_RBTC, NEED_RIF, NEED_STRIF, or null)
 * @returns BannerConfig if a banner should be shown for the missing token, null otherwise
 *
 * @example
 * getBannerConfigForTokenStatus(NEED_RBTC) // Returns rBTC banner config
 * getBannerConfigForTokenStatus(null) // Returns null
 */
const getBannerConfigForTokenStatus = (missingTokenType: string | null): BannerConfig | null => {
  if (!missingTokenType) return null
  return BANNER_CONFIGS[missingTokenType] ? BANNER_CONFIGS[missingTokenType] : null
}

/*
 * ADD YOUR DETECTION FUNCTIONS HERE
 * =================================
 *
 * Follow this pattern for new detection functions:
 *
 * const getBannerConfigForYourUseCase = (userData: YourDataType): BannerConfig | null => {
 *   // Handle loading states
 *   if (!userData || userData.isLoading) return null
 *
 *   // Define clear conditions
 *   const shouldShowBanner = userData.someCondition && !userData.hasCompletedAction
 *
 *   // Return appropriate config or null
 *   if (shouldShowBanner) {
 *     return BANNER_CONFIGS.YOUR_BANNER_KEY
 *   }
 *   return null
 * }
 *
 * Examples:
 *
 * // Rewards detection
 * const getBannerConfigForUnclaimedRewards = (rewardsData: any): BannerConfig | null => {
 *   if (!rewardsData || rewardsData.isLoading) return null
 *
 *   if (rewardsData.hasUnclaimedRewards && rewardsData.amount > 0) {
 *     return BANNER_CONFIGS.CLAIM_REWARDS
 *   }
 *   return null
 * }
 *
 */

/**
 * StackingNotifications Component
 *
 * Displays contextual banner notifications to guide users through various DAO actions.
 *
 * COMPONENT BEHAVIOR:
 * 1. Loads user state data from various hooks
 * 2. Determines which banners should be shown based on detection functions
 * 3. Groups banners by category and randomly selects one per category
 * 4. Renders the selected banners with action buttons
 *
 * EXTENDING THIS COMPONENT:
 * 1. Add your banner config to BANNER_CONFIGS above
 * 2. Create a detection function following the patterns above
 * 3. Add your detection function to the activeBannerConfigs array below
 * 4. If your detection depends on async data, add loading state to dependencies array
 *
 * Check BannerContent.stories.tsx to see banners config
 *
 * @returns JSX.Element with banner notifications or null if no banners should be shown
 */
export const StackingNotifications = () => {
  const router = useRouter()
  // ===============================
  // DATA LOADING AND STATE HOOKS
  // ===============================

  // Existing hooks for token requirements
  const missingTokenType = useRequiredTokens()

  /*
   * ADD YOUR DATA HOOKS HERE
   * ========================
   *
   * Add any hooks needed for your banner detection logic:
   *
   * const rewardsData = useUnclaimedRewards()
   * const proposalsData = useActiveProposals()
   * const stakingData = useStakingStatus()
   * const governanceData = useGovernanceParticipation()
   */

  // ===============================
  // DEPENDENCY LOADING MANAGEMENT
  // ===============================
  // Track loading states to ensure we don't show banners prematurely
  const dependencies = [
    missingTokenType !== undefined,

    /*
     * ADD YOUR LOADING DEPENDENCIES HERE
     * ==================================
     *
     * Add loading state checks for your data:
     *
     * !rewardsData?.isLoading,
     * !proposalsData?.isLoading,
     * !stakingData?.isLoading,
     */
  ]

  // Wait for all dependencies to load before proceeding
  const areDependenciesLoaded = dependencies.every(dependency => dependency)

  if (!areDependenciesLoaded) {
    return null
  }

  // ===============================
  // BANNER DETECTION LOGIC
  // ===============================

  // Calculate all banner configs that should be shown based on current user state
  const activeBannerConfigs = [
    // Existing detection functions
    getBannerConfigForTokenStatus(missingTokenType),

    /*
     * ADD YOUR DETECTION FUNCTIONS HERE
     * =================================
     *
     * Add calls to your detection functions:
     *
     * getBannerConfigForUnclaimedRewards(rewardsData),
     * getBannerConfigForActiveProposals(proposalsData),
     * getBannerConfigForStakingOpportunities(stakingData),
     * getBannerConfigForGovernanceParticipation(governanceData),
     */
  ].filter(Boolean) as BannerConfig[]

  // Early return if no banners should be shown
  if (activeBannerConfigs.length === 0) {
    return null
  }

  // ===============================
  // BANNER SELECTION AND RENDERING
  // ===============================

  // Apply category-based selection (max 1 banner per category)
  const bannerConfigsForDisplay = selectBannerConfigsByCategory(activeBannerConfigs)

  if (bannerConfigsForDisplay.length === 0) {
    return null
  }

  // Render the selected banners
  return (
    <>
      {bannerConfigsForDisplay.map((config, index) => (
        <StackableBanner key={`banner-${index}`}>
          <BannerContent
            title={config.title}
            description={config.description}
            buttonText={config.buttonText}
            buttonOnClick={() => handleActionClick(config, router)}
          />
        </StackableBanner>
      ))}
    </>
  )
}
