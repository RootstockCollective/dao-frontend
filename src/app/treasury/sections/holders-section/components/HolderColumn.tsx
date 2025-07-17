import { Jdenticon } from '@/components/Header/Jdenticon'
import { Span } from '@/components/TypographyNew'
import { EXPLORER_URL } from '@/lib/constants'

interface HolderColumnProps {
  address: string
  rns?: string
}

export const HolderColumn = ({ address, rns }: HolderColumnProps) => {
  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      className="flex items-center gap-1.5 text-white"
    >
      <Jdenticon className="rounded-full bg-white mr-1" value={address} size="30" />
      <Span variant="body" className="text-left overflow-hidden whitespace-nowrap text-primary">
        {rns?.split('.')[0] || address}
      </Span>
    </a>
  )
}
