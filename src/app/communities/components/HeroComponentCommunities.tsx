import { HeroComponent, type HeroComponentProps } from '@/components/HeroComponent'
import { CommunityItemButtonHandler } from '@/app/communities/components/CommunityItemButtonHandler'

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
    className={className}
    imageSrc={imageSrc}
    title={title}
    subtitle={subtitle}
    items={
      items ?? [
        'Collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
        'Whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
        'Be part of something bigger, helping shape the future of Bitcoin.',
        'These aren’t just collectibles. They are your passport to participation.',
      ]
    }
    button={shouldShowLearnMore && <CommunityItemButtonHandler color="black" data-testid="LearnMoreButton" />}
    dataTestId="HeroCommunitiesComponent"
  />
)
