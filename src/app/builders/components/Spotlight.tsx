import React from 'react'

const spotlightData = [
  {
    title: 'Total Backing',
    value: '123,456,789',
    change: '+12.5%',
    currency: 'STRIF',
  },
  {
    title: 'Active Projects',
    value: '1,234',
    change: '+5.2%',
    currency: '',
  },
  {
    title: 'Total Builders',
    value: '123,456',
    change: '+8.7%',
    currency: '',
  },
]

export const Spotlight = () => {
  return (
    <div className="grid grid-cols-3 gap-8 w-full">
      {spotlightData.map((item, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">{item.title}</div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-white">{item.value}</span>
            {item.currency && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-white">{item.currency}</span>
              </div>
            )}
          </div>
          <div className="text-green-500 text-sm mt-2">{item.change}</div>
        </div>
      ))}
    </div>
  )
}

// FIXME: Connect to real spotlight data
// FIXME: Implement backing functionality
