import React from 'react'
import { Metric } from '@/app/shared/components/Metric/Metric'

export const Metrics = () => {
  return (
    <div className="grid grid-cols-3 gap-8 w-full">
      <Metric
        title="Total backing"
        content={
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">123,456,789</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-white">STRIF</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-1">GLOBAL BUILDING USD</div>
          </div>
        }
      />
      <Metric
        title="Currently backed projects"
        content={<div className="text-3xl font-bold text-white">1,234</div>}
      />
      <Metric
        title="Total active Builders"
        content={<div className="text-3xl font-bold text-white">123,456</div>}
      />
    </div>
  )
}

// FIXME: Connect metrics to real data source
// FIXME: Implement real-time updates for metrics
