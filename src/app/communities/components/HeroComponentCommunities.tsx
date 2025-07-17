import { HeroComponent } from '@/components/HeroComponent'

export const HeroCommunitiesComponent = () => (
  <HeroComponent
    imageSrc="/images/hero/community-banner.png"
    title="SHOW YOUR TRUE COLORS."
    subtitle="CURATED BY THE COLLECTIVE"
    items={[
      'collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
      'whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
      'be part of something bigger, helping shape the future of Bitcoin.',
      'these aren’t just collectibles. They are your passport to participation.',
    ]}
    className="mt-6"
  />
)
