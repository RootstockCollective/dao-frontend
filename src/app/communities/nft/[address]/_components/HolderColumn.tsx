import Image from 'next/image'
import { Span } from '@/components/Typography'
import { EXPLORER_URL } from '@/lib/constants'
import { ExternalLinkIcon } from '@/components/Icons'

interface HolderColumnProps {
  address: string
  rns?: string
  image?: string
}

export const HolderColumn = ({ address, rns, image }: HolderColumnProps) => (
  <a
    href={`${EXPLORER_URL}/address/${address}`}
    target="_blank"
    className="flex items-center gap-1.5 text-white"
    data-testid="HolderColumn"
  >
    <Image
      unoptimized
      src={image || '/images/treasury/holders.png'}
      width={24}
      height={24}
      alt="Holders Image"
    />
    <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px]">
      {rns || address}
    </Span>
    <ExternalLinkIcon size={18} />
  </a>
)
