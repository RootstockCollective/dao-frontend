import React from 'react';

export const Metrics = () => {
  return (
    <div className="grid grid-cols-3 gap-8 w-full">
      <div>
        <div className="text-gray-400 text-sm mb-2">Total backing</div>
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-white">123,456,789</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-white">STRIF</span>
          </div>
        </div>
        <div className="text-gray-400 text-xs mt-1">GLOBAL BUILDING USD</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Currently backed projects</div>
        <div className="text-3xl font-bold text-white">1,234</div>
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Total active Builders</div>
        <div className="text-3xl font-bold text-white">123,456</div>
      </div>
    </div>
  );
};

// FIXME: Connect metrics to real data source
// FIXME: Implement real-time updates for metrics