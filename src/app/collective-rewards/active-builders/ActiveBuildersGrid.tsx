import { FC } from 'react'
import { ActiveBuildersGridItem } from '@/app/collective-rewards/active-builders'
import { useSearchContext } from '@/app/collective-rewards/shared'
import { Builder } from '@/app/collective-rewards/types'

export const ActiveBuildersGrid: FC = () => {
  const { data: items } = useSearchContext<Builder>()

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* TODO: To be reviewed in the design */}
      {items.length === 0 && <div>No builders found</div>}
      {items.length > 0 && items.map(item => <ActiveBuildersGridItem key={item.address} {...item} />)}
    </div>
  )
}
