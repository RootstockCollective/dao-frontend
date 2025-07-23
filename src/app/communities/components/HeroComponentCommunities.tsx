import { HeroComponent, HeroComponentProps } from '@/components/HeroComponent'
import { CommunityItemButtonHandler } from '@/app/communities/components/CommunityItemButtonHandler'
import { cn } from '@/lib/utils'

export interface HeroCommuntiesSectionProps extends Partial<HeroComponentProps> {
  shouldShowLearnMore?: boolean
}
export const HeroCommunitiesComponent = ({
  imageSrc = '/images/hero/community-banner.png',
  title = 'SHOW YOUR TRUE COLORS.',
  subtitle = 'CURATED BY THE COLLECTIVE',
  items,
  className,
  shouldShowLearnMore = false,
}: HeroCommuntiesSectionProps) => (
  <HeroComponent
    className={cn('mt-6', className)}
    imageSrc={imageSrc}
    title={title}
    subtitle={subtitle}
    items={
      items ?? [
        'collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
        'whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
        'be part of something bigger, helping shape the future of Bitcoin.',
        'these aren’t just collectibles. They are your passport to participation.',
      ]
    }
    button={shouldShowLearnMore ? <CommunityItemButtonHandler color="black" /> : undefined}
  />
)
