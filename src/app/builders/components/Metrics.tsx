import { ActiveBuilders } from './ActiveBuilders'
import { EstimatedRewards } from './EstimatedRewards'
import { TotalBacking } from './TotalBacking'

export const Metrics = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full items-start">
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
