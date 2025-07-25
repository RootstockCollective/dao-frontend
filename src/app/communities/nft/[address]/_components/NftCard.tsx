import Image from 'next/image'
import { cn, truncateMiddle } from '@/lib/utils'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { EXPLORER_URL } from '@/lib/constants'
import { Paragraph, Header } from '@/components/TypographyNew'

interface NftCardProps {
  image: string
  id: string
  holderAddress: string
  ensDomain?: string
  format?: 'big' | 'small'
}

export function NftCard({ image, id, holderAddress, ensDomain, format }: NftCardProps) {
  const optimizedImageUrl = applyPinataImageOptions(image, { width: 600, height: 600 })

  return (
    <div
      className={cn(
        'w-full aspect-4/5 bg-bg-60 rounded flex flex-col gap-[min(1rem,1vw)] p-[min(1rem,1.5vw)]',
        format === 'big' ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1',
      )}
    >
      <div className="grow relative w-full">
        <Image
          unoptimized
          src={optimizedImageUrl}
          fill
          alt="NFT"
          crossOrigin="anonymous"
          className="object-cover"
        />
      </div>
      <div className="w-full">
        <a
          href={`${EXPLORER_URL}/address/${holderAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline decoration-primary"
        >
          <Header
            variant="h3"
            className="text-primary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed tracking-tight truncate first-letter:uppercase"
          >
            {ensDomain ?? truncateMiddle(holderAddress, 5, 5)}
          </Header>
        </a>
        <Paragraph className="text-xs md:text-sm lg:text-base">ID #{id}</Paragraph>
      </div>
    </div>
  )
}
