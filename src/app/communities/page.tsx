import { SectionContainer } from './components/SectionContainer'
import { CommunityItem } from '@/app/communities/CommunityItem'
import {
  betaBuilders,
  earlyAdoptersCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
  rootstockHacktivator,
  vanguardCommunity,
} from '@/app/communities/communityUtils'
import { Header } from '@/components/TypographyNew'
import { HeroComponent } from '@/components/HeroComponent'

export const dynamic = 'force-static'

/**
 * Server Component: Renders the Communities page as a static route (SSG) using 'force-static' mode.
 * The page is generated at build time and won't change until the next deployment
 * Client-side interactivity is managed by injected client components
 */
export default function Communities() {
  return (
    <div>
      <Header>COMMUNITIES</Header>
      <div className="flex flex-col gap-2">
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
        <SectionContainer
          title="BADGES"
          rightContent="These are earned for specific tasks - they are NFTs that come with functionality, some just medals of honour. Badges can unlock voting capabilities and help you earn BTC-based rewards through RootstockCollective."
        >
          <div>
            {/* Communities */}
            <div className="grid lg:grid-cols-4 gap-2 md:grid-cols-1">
              <CommunityItem {...earlyAdoptersCommunity} />
              <div className="col-span-2">
                {/* First */}
                <CommunityItem {...ogFounders} variant="landscape" enableDebris />
                {/* Other 2 next to each other */}
                <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-2 mt-2">
                  <CommunityItem {...ogFoundersExternalContributors} />
                  <CommunityItem {...ogFoundersEcosystemPartners} />
                </div>
              </div>
              <CommunityItem {...vanguardCommunity} />
            </div>
          </div>
        </SectionContainer>
        <SectionContainer
          title="CLUBS"
          rightContent="These are essentially a group where people with likeminded interests can discuss ideas. Some are gated with NFTs, and in the future it may be possible to give anyone the ability to request a  club is created. The more you participate — from proposals to governance to community — the more opportunities you have to collect. "
        >
          <div>
            {/* Communities */}
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-2">
              <CommunityItem {...betaBuilders} variant="landscape" enableDebris />
              <CommunityItem {...rootstockHacktivator} variant="landscape" enableDebris />
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
