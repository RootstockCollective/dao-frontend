import { SectionContainer } from './components/SectionContainer'
import { ResponsiveCommunityItemHOC } from './components/ResponsiveCommunityItemHOC'
import {
  betaBuilders,
  earlyAdoptersCommunity,
  ogFounders,
  ogFoundersEcosystemPartners,
  ogFoundersExternalContributors,
  rootstockHacktivator,
  rootlingsS1,
  vanguardCommunity,
} from '@/app/communities/communityUtils'
import { HeroCommunitiesComponent } from '@/app/communities/components'

export const dynamic = 'force-static'

/**
 * Server Component: Renders the Communities page as a static route (SSG) using 'force-static' mode.
 * The page is generated at build time and won't change until the next deployment
 * Client-side interactivity is managed by injected client components
 */
export default function Communities() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <HeroCommunitiesComponent />
        <SectionContainer
          title="BADGES"
          rightContent="These are earned for specific tasks - they are NFTs that come with functionality, some just medals of honour. Badges can unlock voting capabilities and help you earn BTC-based rewards through RootstockCollective."
        >
          {/* Communities */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <ResponsiveCommunityItemHOC className="lg:row-span-2" {...earlyAdoptersCommunity} enableDebris />
            <ResponsiveCommunityItemHOC
              className="lg:col-span-2"
              {...ogFounders}
              variant="landscape"
              enableDebris
            />
            <ResponsiveCommunityItemHOC
              className="lg:row-span-2"
              {...ogFoundersEcosystemPartners}
              enableDebris
            />
            <ResponsiveCommunityItemHOC
              className="lg:col-span-2"
              {...ogFoundersExternalContributors}
              variant="landscape"
              enableDebris
            />
            <ResponsiveCommunityItemHOC
              className="lg:col-span-2"
              variant="landscape"
              {...rootlingsS1}
              enableDebris
            />
            <ResponsiveCommunityItemHOC
              className="lg:col-span-2"
              variant="landscape"
              {...vanguardCommunity}
              enableDebris
            />
          </div>
        </SectionContainer>
        <SectionContainer
          title="CLUBS"
          rightContent="These are essentially a group where people with likeminded interests can discuss ideas. Some are gated with NFTs, and in the future it may be possible to give anyone the ability to request a  club is created. The more you participate — from proposals to governance to community — the more opportunities you have to collect. "
        >
          <div>
            {/* Communities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <ResponsiveCommunityItemHOC {...betaBuilders} variant="landscape" enableDebris />
              <ResponsiveCommunityItemHOC {...rootstockHacktivator} variant="landscape" enableDebris />
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
