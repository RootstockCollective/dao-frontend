import {
  useRequiredTokens,
  NEED_RBTC,
  NEED_RIF,
  NEED_STRIF,
} from '@/app/user/IntroModal/hooks/useRequiredTokens'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'
import { handleActionClick } from './utils'
import { BannerConfigMap, BannerConfig } from './types'

// Static token images - created once outside component
const rbtcImage = <TokenImage symbol={RBTC} size={26} className="inline-block mt-[-0.2rem]" />
const rifImage = <TokenImage symbol={RIF} size={24} className="inline-block mt-[-0.2rem]" />

// Banner configuration with integrated link config and categories
const BANNER_CONFIGS: BannerConfigMap = {
  [NEED_RBTC]: {
    title: <span>GET {rbtcImage} rBTC</span>,
    buttonText: 'Get rBTC',
    description:
      "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
    category: 'TOKEN',
    action: {
      url: currentLinks.rbtc,
      external: true,
    },
  },
  [NEED_RIF]: {
    title: <span>GET {rifImage} RIF</span>,
    buttonText: 'Get RIF',
    description:
      "RIF is the token required for staking. You'll need both RBTC and RIF to participate in the DAO.",
    category: 'TOKEN',
    action: {
      url: currentLinks.getRif,
      external: true,
    },
  },
  [NEED_STRIF]: {
    title: <span>STAKE {rifImage} RIF</span>,
    buttonText: 'Stake RIF',
    description: 'Use RIF to stake and RBTC to pay for transactions fees.',
    category: 'TOKEN',
    action: {
      url: '/user?action=stake',
      external: false,
    },
  },
}

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

/**
 * StackingNotifications Component
 *
 * Displays contextual banner notifications to guide users.
 *
 * 1. Shows relevant banner(s) with action buttons to help users
 * 2. Groups banners by category and randomly selects one per category to avoid clutter
 *
 * @returns JSX.Element with banner notifications or null if no banners should be shown
 */
export const StackingNotifications = () => {
  const missingTokenType = useRequiredTokens()

  // Load all dependencies here
  const dependencies = [missingTokenType !== undefined]

  // Are all dependencies loaded? No = null; yes = continue
  const areDependenciesLoaded = dependencies.every(dependency => dependency)

  if (!areDependenciesLoaded) {
    return null
  }

  // Calculate all banner configs. Add more here (like checking if user has rewards, etc)
  const activeBannerConfigs = [getBannerConfigForTokenStatus(missingTokenType)].filter(
    Boolean,
  ) as BannerConfig[]

  if (activeBannerConfigs.length === 0) {
    return null
  }

  // Get banner configs by category (up to 2, one per category)
  const bannerConfigsForDisplay = selectBannerConfigsByCategory(activeBannerConfigs)

  if (bannerConfigsForDisplay.length === 0) {
    return null
  }

  return (
    <>
      {bannerConfigsForDisplay.map((config, index) => (
        <StackableBanner key={`banner-${index}`}>
          <BannerContent
            title={config.title}
            description={config.description}
            buttonText={config.buttonText}
            buttonOnClick={() => handleActionClick(config)}
          />
        </StackableBanner>
      ))}
    </>
  )
}
