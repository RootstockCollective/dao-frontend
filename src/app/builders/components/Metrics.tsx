import { ActiveBuilders } from './ActiveBuilders'
import { EstimatedRewards } from './EstimatedRewards'
import { TotalBacking } from './TotalBacking'

export const Metrics = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full items-start">
      <div className="basis-1/5 hidden md:flex">
        <TotalBacking />
      </div>
      <div className="basis-1/5 hidden md:flex">
        <ActiveBuilders />
      </div>

      <div className="flex justify-between w-full items-start md:hidden">
        <TotalBacking />
        <ActiveBuilders />
      </div>

      <EstimatedRewards />
    </div>
  )
}
