import { FC } from 'react'
import { BuilderOffChainInfo } from '@/app/bim/types'
import { WhitelistGridItem } from '@/app/bim/whitelist/WhitelistGridItem'

interface WhitelistGridProps {
  items: BuilderOffChainInfo[]
}

export const WhitelistGrid: FC<WhitelistGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map(item => (
        <WhitelistGridItem key={item.address} {...item} />
      ))}
    </div>
  )
}
