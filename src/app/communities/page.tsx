'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { firstCommunity } from '@/app/communities/communityUtils'

export default function Communities() {
  return (
    <MainContainer notProtected>
      <div className="ml-[24px]">
        <Image
          src="/images/communities-header.svg"
          alt="Communities"
          width={0}
          height={0}
          style={{ width: '100%', height: 'auto' }}
        />
        <div className="mt-[16px]">
          <CommunityItem {...firstCommunity} /> {/* @TODO remove and fetch dynamically? [after mvp] */}
        </div>
      </div>
    </MainContainer>
  )
}
