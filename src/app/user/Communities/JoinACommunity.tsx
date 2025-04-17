import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export const JoinACommunity = () => {
  const router = useRouter()

  return (
    <div className="relative w-full h-[482px]">
      <Image
        src="/images/nfts/empty-nft-cover.png"
        alt="join-communities-cover"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        <Header className="mt-[42px] mb-[8px] text-[40px]" fontFamily="kk-topo">
          {'JOIN A COMMUNITY'}
          <br />
          {'AND EARN BOOSTS'}
        </Header>
        <Button variant="white" className="mt-4" onClick={() => router.push('/communities')}>
          Get an NFT
        </Button>
      </div>
    </div>
  )
}
