import { Jdenticon } from '@/components/Header/Jdenticon'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { EXPLORER_URL } from '@/lib/constants'
import { formatAmount, shortAddress } from '@/lib/utils'
import { Address } from 'viem'

interface MobileHolderCardProps {
  address: Address
  rns?: string
  amount: string
  className?: string
}

export const MobileHolderCard = ({ address, rns, amount, className = '' }: MobileHolderCardProps) => {
  const displayAddress = rns?.split('.')[0] || shortAddress(address, 8)

  return (
    <div className={`flex flex-col p-4 bg-bg-80 rounded-lg border-b border-bg-60 ${className}`}>
      {/* First row - Jdenticon and Address */}
      <div className="flex items-center gap-3">
        <Jdenticon className="rounded-full bg-white flex-shrink-0" value={address} size="40" />
        <a
          href={`${EXPLORER_URL}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary truncate"
        >
          <Span variant="body" className="text-primary truncate">
            {displayAddress}
          </Span>
        </a>
      </div>

      {/* Second row - Spacer and Value with stRIF icon */}
      <div className="flex items-center gap-3">
        {/* Invisible spacer to match jdenticon size */}
        <div className="w-10 h-5 flex-shrink-0" />
        <div className="flex items-center gap-1">
          <Span variant="body-s" className="text-text-100">
            {formatAmount(amount)}
          </Span>
          <TokenImage symbol="stRIF" size={16} />
          <Span variant="body-s" className="text-text-100">
            stRIF
          </Span>
        </div>
      </div>
    </div>
  )
}
