import Image from 'next/image'
import { cn, truncateMiddle } from '@/lib/utils'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { EXPLORER_URL } from '@/lib/constants'
import { Paragraph, Header } from '@/components/Typography'
import type { ComponentProps } from 'react'

interface NftCardProps extends ComponentProps<'div'> {
  image: string
  id: string
  holderAddress: string
  ensDomain?: string
}

export function NftCard({ image, id, holderAddress, ensDomain, className, ...props }: NftCardProps) {
  const optimizedImageUrl = applyPinataImageOptions(image, { width: 600, height: 600 })

  return (
    <div className={cn('w-full bg-bg-60 rounded flex flex-col gap-4 p-4', className)} {...props}>
      <div className="grow relative w-full aspect-square">
        <Image
          unoptimized
          src={optimizedImageUrl}
          fill
          alt="NFT"
          crossOrigin="anonymous"
          className="object-cover"
        />
      </div>
      <div className="w-full flex flex-row items-start justify-between md:items-start md:flex-col">
        <a
          href={`${EXPLORER_URL}/address/${holderAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline decoration-primary w-full"
        >
          <Header
            variant="h3"
            className="text-primary text-xl md:text-lg lg:text-xl tracking-tight truncate first-letter:uppercase"
          >
            {ensDomain ?? truncateMiddle(holderAddress, 5, 5)}
          </Header>
        </a>
        <Paragraph className="whitespace-nowrap">ID #{id}</Paragraph>
      </div>
    </div>
  )
}
