import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { CycleContextProvider, useCycleContext } from '@/app/collective-rewards/metrics'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useRequiredTokens } from '@/app/user/IntroModal/hooks/useRequiredTokens'

import { NotificationBanner } from './components'
import {
  getBannerConfigForBacking,
  getBannerConfigForCycleEnded,
  getBannerConfigForCycleEnding,
  getBannerConfigForKycOnly,
  getBannerConfigForStartBuilding,
  getBannerConfigForTokenStatus,
  selectBannerConfigs,
} from './configs'
import { getStackArtwork } from './constants'
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
 * - Priority: STACK_ORDER (configs.tsx) sets the order; add new banner ids there, or they go last
 * - Families: banners telling the same story (the two cycle ones) show at most one at a time
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
 * 3. Shows every active banner in priority order (see STACK_ORDER in configs.tsx)
 * 4. Renders the selected banners with action buttons
 *
 * EXTENDING THIS COMPONENT:
 * 1. Add your banner config to BANNER_CONFIGS above
 * 2. Create a detection function following the patterns above
 * 3. Add your detection function to the activeBannerConfigs array below
 * 4. If your detection depends on async data, add loading state to dependencies array
 *
 * Each selected banner renders as its own NotificationBanner card. Dismissing one hides it
 * for the session; a reload brings it back.
 *
 * @returns JSX.Element with banner notifications or null if no banners should be shown
 */
const StackingNotificationsContent = () => {
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
    builderState.initialized &&
    !builderState.communityApproved &&
    !builderState.kycPaused &&
    !builderState.selfPaused

  const isStartBuilding =
    builderState.kycApproved &&
    builderState.initialized &&
    builderState.communityApproved &&
    !builderState.kycPaused &&
    !builderState.selfPaused

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

  // ===============================
  // BANNER SELECTION AND RENDERING
  // ===============================

  const bannerConfigsForDisplay = useMemo(
    () => selectBannerConfigs(activeBannerConfigs),
    [activeBannerConfigs],
  )

  // Wait for all dependencies to load before proceeding
  const areDependenciesLoaded = dependencies.every(dependency => dependency)

  // Only block rendering on FIRST load, not on subsequent polling updates
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Dismissals last for the session only: a reload brings every notification back
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    if (areDependenciesLoaded && !hasLoadedOnce) {
      setHasLoadedOnce(true)
    }
  }, [areDependenciesLoaded, hasLoadedOnce])

  if (!hasLoadedOnce) {
    return null // Only return null before first successful load
  }

  // Early return if no banners should be shown
  if (activeBannerConfigs.length === 0) {
    return null
  }

  if (bannerConfigsForDisplay.length === 0) {
    return null
  }

  const visibleBannerConfigs = bannerConfigsForDisplay.filter(config => !dismissedIds.includes(config.id))

  if (visibleBannerConfigs.length === 0) {
    return null
  }

  // Render the selected banners
  return (
    <div className="mb-3 flex w-full flex-col gap-2" data-testid="StackingNotifications">
      {/* Walking the whole stack rather than what is left of it keeps every card's looks tied
          to the place it was given, so dismissing one never restyles the others. */}
      {bannerConfigsForDisplay.map((config, position) => {
        if (dismissedIds.includes(config.id)) {
          return null
        }

        const { backgroundSrc, backgroundPosition, scrim } = getStackArtwork(position)

        return (
          <NotificationBanner
            key={config.id}
            title={config.title}
            description={config.description}
            backgroundSrc={backgroundSrc}
            backgroundPosition={backgroundPosition}
            scrim={scrim}
            buttonText={config.buttonText}
            buttonOnClick={() => handleActionClick(config, router)}
            rightContent={config.rightContent}
            onDismiss={() => setDismissedIds(ids => [...ids, config.id])}
          />
        )
      })}
    </div>
  )
}

export const StackingNotifications = () => {
  return (
    <CycleContextProvider>
      <StackingNotificationsContent />
    </CycleContextProvider>
  )
}
