import { FC } from 'react'
import { WhitelistGridItem } from '@/app/bim/whitelist/WhitelistGridItem'
import { BuilderProposal } from '@/app/bim/whitelist/hooks/useGetFilteredBuilders'

interface WhitelistGridProps {
  items: BuilderProposal[]
}

export const WhitelistGrid: FC<WhitelistGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* TODO: To be reviewed in the design */}
      {items.length === 0 && <div>No builders found</div>}
      {items.length > 0 && items.map(item => <WhitelistGridItem key={item.address} {...item} />)}
    </div>
  )
}
