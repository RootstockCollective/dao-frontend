import { FC } from 'react'
import { ActiveBuildersGridItem, BuilderWithStatus } from '@/app/collective-rewards/active-builders'
import { useSearchContext } from '@/app/collective-rewards/shared'

export const ActiveBuildersGrid: FC = () => {
  const { getValues } = useSearchContext()
  const items = getValues<BuilderWithStatus>()

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* TODO: To be reviewed in the design */}
      {items.length === 0 && <div>No builders found</div>}
      {items.length > 0 && items.map(item => <ActiveBuildersGridItem key={item.address} {...item} />)}
    </div>
  )
}
