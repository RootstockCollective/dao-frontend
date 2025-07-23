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
const bannerConfig: BannerConfigMap = {
  [NEED_RBTC]: {
    title: <span>GET {rbtcImage} rBTC</span>,
    buttonText: 'Get rBTC',
    description:
      "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
    category: 'DAO',
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
    category: 'DAO',
    action: {
      url: currentLinks.getRif,
      external: true,
    },
  },
  [NEED_STRIF]: {
    title: <span>STAKE {rifImage} RIF</span>,
    buttonText: 'Stake RIF',
    description: 'Use RIF to stake and RBTC to pay for transactions fees.',
    category: 'DAO',
    action: {
      url: '/user?action=stake',
      external: false,
    },
  },
}

/**
 * Groups banner configs by category and randomly selects one from each category
 * Returns up to 2 banner configs (one per category)
 */
const getConditionsByCategory = (bannerConfigs: BannerConfig[]): BannerConfig[] => {
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

// Condition functions that return banner configs or null
const getTokenStatusCondition = (tokenStatus: string | null) => {
  if (!tokenStatus) return null
  return bannerConfig[tokenStatus] ? bannerConfig[tokenStatus] : null
}

export const StackingNotifications = () => {
  const tokenStatus = useRequiredTokens()

  // Load all dependencies here
  const dependencies = [tokenStatus !== undefined]

  // Are all dependencies loaded? No = null; yes = continue
  const areDependenciesLoaded = dependencies.every(dependency => dependency)

  if (!areDependenciesLoaded) {
    return null
  }

  // Calculate all conditions that are met
  const metConditions = [getTokenStatusCondition(tokenStatus)].filter(Boolean) as BannerConfig[]

  if (metConditions.length === 0) {
    return null
  }

  // Get banner configs by category (up to 2, one per category)
  const selectedBannerConfigs = getConditionsByCategory(metConditions)

  if (selectedBannerConfigs.length === 0) {
    return null
  }

  return (
    <>
      {selectedBannerConfigs.map((config, index) => (
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
