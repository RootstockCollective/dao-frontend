import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { communitiesByCategory } from '@/app/communities/communityUtils'
import { HeaderTitle } from '@/components/Typography'

export const dynamic = 'force-static'

/**
 * Server Component: Renders the Communities page as a static route (SSG) using 'force-static' mode.
 * The page is generated at build time and won't change until the next deployment
 * Client-side interactivity is managed by injected client components
 */
export default function Communities() {
  return (
    <div className="flex flex-col ml-[24px]">
      <div>
        <Image
          src="/images/communities-banner.svg"
          alt="Communities"
          width={0}
          height={0}
          className="w-full mb-[48px]"
        />
      </div>
      {Object.entries(communitiesByCategory).map(([category, communities]) => (
        <div key={category} className="mb-[51px]">
          <HeaderTitle className="text-[32px]">{category}</HeaderTitle>
          <div className="flex flex-wrap mt-[32px] gap-[24px]">
            {communities.map(community => (
              <CommunityItem key={community.title} {...community} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
