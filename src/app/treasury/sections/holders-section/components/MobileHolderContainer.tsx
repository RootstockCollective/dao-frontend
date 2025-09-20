import { ReactNode } from 'react'
import { MobileHolderCard } from '@/app/treasury/components/MobileHolderCard'

interface HolderData {
  holder: {
    address: string
    rns: string
  }
  quantity: string
}

interface MobileHolderContainerProps {
  holders: HolderData[]
  paginationElement: ReactNode
}

export const MobileHolderContainer = ({ holders, paginationElement }: MobileHolderContainerProps) => {
  return (
    <div className="flex flex-col gap-2 mt-8" data-testid="HoldersMobile">
      {holders.map(h => (
        <MobileHolderCard
          key={h.holder.address}
          amount={h.quantity}
          address={h.holder.address as `0x${string}`}
          rns={h.holder.rns}
        />
      ))}
      {paginationElement}
    </div>
  )
}
