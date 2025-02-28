import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { communitiesToRender } from '@/app/communities/communityUtils'

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
          src="/images/communities-header.svg"
          alt="Communities"
          width={0}
          height={0}
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex flex-wrap mt-[16px] gap-[24px]">
        {communitiesToRender.map(community => (
          <CommunityItem key={community.title} {...community} />
        ))}
      </div>
    </div>
  )
}
