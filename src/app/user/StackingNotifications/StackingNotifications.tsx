import { useCycleContext } from '@/app/collective-rewards/metrics'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useRequiredTokens } from '@/app/user/IntroModal/hooks/useRequiredTokens'
import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { DateTime, Duration } from 'luxon'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import {
  getBannerConfigForBacking,
  getBannerConfigForCycleEnded,
  getBannerConfigForCycleEnding,
  getBannerConfigForKycOnly,
  getBannerConfigForStartBuilding,
  getBannerConfigForTokenStatus,
  selectBannerConfigsByCategory,
} from './configs'
import { useGetBuilderState } from './hooks/useGetBuilderState'
import { useHasAvailableBacking } from './hooks/useHasAvailableForBacking'
import { BannerConfig } from './types'
import { handleActionClick } from './utils'

/*
 * =====================================================================================
 * STACKING NOTIFICATIONS COMPONENT - DEVELOPER GUIDE
 * =====================================================================================
 *
 * This component displays contextual banner notifications to guide users through
 * various actions in the DAO. The system is designed to be modular and extensible.
 *
 * QUICK START - Adding a New Banner:
 * 1. Add your banner config to BANNER_CONFIGS
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
  const { address } = useAccount()
  // ===============================
  // DATA LOADING AND STATE HOOKS
  // ===============================

  // Existing hooks for token requirements
  const missingTokenType = useRequiredTokens()
  const {
    hasAvailableBacking,
    isLoading: isAvailableBackingLoading,
    error: availableBackingError,
  } = useHasAvailableBacking(address ?? zeroAddress)

  const { builderState, isLoading: isBuilderStateLoading, error: builderStateError } = useGetBuilderState()

  const isOnlyKycApproved =
    builderState.kycApproved &&
    builderState.activated &&
    !builderState.communityApproved &&
    !builderState.paused &&
    !builderState.revoked

  const isStartBuilding =
    builderState.kycApproved &&
    builderState.activated &&
    builderState.communityApproved &&
    !builderState.paused &&
    !builderState.revoked

  const { data: cycle, isLoading: isCycleLoading, error: cycleError } = useCycleContext()

  useHandleErrors({
    error: cycleError || builderStateError || availableBackingError,
    title: 'Error loading the banner content',
  })

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
    !isAvailableBackingLoading,
    !isBuilderStateLoading,
    !isCycleLoading,

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

  // ===============================
  // BANNER DETECTION LOGIC
  // ===============================

  // Calculate all banner configs that should be shown based on current user state
  const activeBannerConfigs = useMemo(
    () =>
      [
        // Existing detection functions
        getBannerConfigForTokenStatus(missingTokenType),
        getBannerConfigForBacking(hasAvailableBacking),
        getBannerConfigForKycOnly(isOnlyKycApproved),
        getBannerConfigForStartBuilding(isStartBuilding),
        getBannerConfigForCycleEnding(cycle),
        getBannerConfigForCycleEnded(cycle),

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
      ].filter(Boolean) as BannerConfig[],
    [missingTokenType, hasAvailableBacking, isOnlyKycApproved, isStartBuilding, cycle],
  )

  // Wait for all dependencies to load before proceeding
  const areDependenciesLoaded = dependencies.every(dependency => dependency)

  if (!areDependenciesLoaded) {
    return null
  }

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
      <StackableBanner>
        {bannerConfigsForDisplay.map((config, index) => (
          <BannerContent
            key={`banner-${index}`}
            title={config.title}
            description={config.description}
            buttonText={config.buttonText}
            buttonOnClick={() => handleActionClick(config, router)}
            rightContent={config.rightContent}
          />
        ))}
      </StackableBanner>
    </>
  )
}
