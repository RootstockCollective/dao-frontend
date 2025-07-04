import { Metric } from '@/components/Metric'
import { RIFToken } from '@/app/backing/components/RIFToken/RIFToken'

export const Metrics = () => {
  return (
    <div className="grid grid-cols-3 gap-8 w-full items-start">
      <Metric title="Total backing">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-white">123,456,789</span>
            <div className="flex items-center space-x-1">
              <RIFToken
                size={20}
                className="pt-2 pl-2 pb-2 pr-0"
                textClassName="text-lg font-bold leading-[133%]"
              />
            </div>
          </div>
          <div className="text-v3-bg-accent-0 text-xs mt-1 font-rootstock-sans">123,456,789.00 USD</div>
        </div>
      </Metric>
      <Metric title="Currently backed projects">
        <div className="text-3xl font-bold text-white">1,234</div>
      </Metric>
      <Metric title="Total active Builders">
        <div className="text-3xl font-bold text-white">123,456</div>
      </Metric>
    </div>
  )
}

// FIXME: Connect metrics to real data source
// FIXME: Implement real-time updates for metrics
