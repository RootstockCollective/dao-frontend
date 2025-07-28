import { ActiveBuilders } from './ActiveBuilders'
import { EstimatedRewards } from './EstimatedRewards'
import { TotalBacking } from './TotalBacking'

export const Metrics = () => {
  return (
    <div className="flex gap-12 w-full">
      <div className="flex basis-1/5">
        <TotalBacking />
      </div>
      <div className="flex basis-1/5">
        <ActiveBuilders />
      </div>
      <EstimatedRewards />
    </div>
  )
}
