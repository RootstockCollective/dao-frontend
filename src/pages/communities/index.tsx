'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import Image from 'next/image'
import { useAccount } from 'wagmi'

export default function Proposals() {
  const { isConnected } = useAccount()
  return (
    <MainContainer>
      <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
        <div className="flex w-full">
          {isConnected && (
            <Image
              src="/images/communities-header.svg"
              alt="Communities"
              width={0}
              height={0}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
      </div>
    </MainContainer>
  )
}
