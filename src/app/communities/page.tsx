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
          items={['tbd...', 'tbd...', 'tbd...', 'tbd...']}
          className="mt-6"
        />
        <SectionContainer title="BADGES">
          <div>
            {/* Communities */}
            <div className="grid grid-cols-4 gap-2">
              <CommunityItem {...earlyAdoptersCommunity} />
              <div className="col-span-2">
                {/* First */}
                <CommunityItem {...ogFounders} variant="landscape" />
                {/* Other 2 next to each other */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <CommunityItem {...ogFoundersEcosystemPartners} />
                  <CommunityItem {...ogFoundersExternalContributors} />
                </div>
              </div>
              <CommunityItem {...vanguardCommunity} />
            </div>
          </div>
        </SectionContainer>
        <SectionContainer title="CLUBS">
          <div>
            {/* Communities */}
            <div className="grid grid-cols-2 gap-2">
              <CommunityItem {...betaBuilders} variant="landscape" enableDebris />
              <CommunityItem {...rootstockHacktivator} variant="landscape" enableDebris />
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
