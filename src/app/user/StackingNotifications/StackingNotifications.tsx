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
import { BannerConfigMap } from './types'

// Static token images - created once outside component
const rbtcImage = <TokenImage symbol={RBTC} size={26} className="inline-block mt-[-0.2rem]" />
const rifImage = <TokenImage symbol={RIF} size={24} className="inline-block mt-[-0.2rem]" />

// Banner configuration with integrated link config
const bannerConfig: BannerConfigMap = {
  [NEED_RBTC]: {
    title: <span>GET {rbtcImage} rBTC</span>,
    buttonText: 'Get rBTC',
    description:
      "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO.",
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
      url: '/user?action=stake',
      external: false,
    },
  },
}

export const StackingNotifications = () => {
  const tokenStatus = useRequiredTokens()

  if (!tokenStatus) {
    return null
  }

  const config = bannerConfig[tokenStatus]

  if (!config) {
    return null
  }

  return (
    <StackableBanner>
      <BannerContent
        title={config.title}
        description={config.description}
        buttonText={config.buttonText}
        buttonOnClick={() => handleActionClick(config)}
      />
    </StackableBanner>
  )
}
