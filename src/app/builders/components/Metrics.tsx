import { ActiveBuilders } from './ActiveBuilders'
import { EstimatedRewards } from './EstimatedRewards'
import { TotalBacking } from './TotalBacking'

export const Metrics = () => {
  return (
    <div className="grid grid-cols-4 gap-8 w-full items-start">
      <TotalBacking />
      <ActiveBuilders />
      <EstimatedRewards />
    </div>
  )
}
