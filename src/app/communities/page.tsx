'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { communitiesToRender } from '@/app/communities/communityUtils'

export default function Communities() {
  return (
    <MainContainer notProtected>
      <div className="ml-[24px]">
        <div className="relative h-[407px]">
          <Image src="/images/communities-header.png" alt="Communities" fill />
        </div>
        <div className="mt-[16px] flex flex-wrap gap-[24px]">
          {communitiesToRender.map(community => (
            <CommunityItem key={community.title} {...community} />
          ))}
        </div>
      </div>
    </MainContainer>
  )
}
