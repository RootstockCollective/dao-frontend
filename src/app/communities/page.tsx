import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { communitiesToRender } from '@/app/communities/communityUtils'

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
