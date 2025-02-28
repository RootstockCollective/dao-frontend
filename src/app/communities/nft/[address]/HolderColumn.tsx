import { Span } from '@/components/Typography'
import { EXPLORER_URL } from '@/lib/constants'
import { RxExternalLink } from 'react-icons/rx'

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
  >
    <img src={image || '/images/treasury/holders.png'} width={24} height={24} alt="Holders Image" />
    <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px]">
      {rns || address}
    </Span>
    <RxExternalLink size={18} />
  </a>
)
