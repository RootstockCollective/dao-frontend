import React from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

export const Table = () => {
  const builders = [
    { name: 'Beefy', rewards: 50, change: 10, amount: '300.00 USD', positive: true },
    { name: 'Good', rewards: 50, change: 10, amount: '300.00 USD', positive: true },
  ];

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Builder</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Rewards
                <ChevronDown className="w-3 h-3 inline ml-1" />
              </th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">
                Change
                <ChevronDown className="w-3 h-3 inline ml-1" />
              </th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {builders.map((builder, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${
                  ''
                }`}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <span className={'text-orange-400'}>
                      {builder.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-gray-300">{builder.rewards}</td>
                <td className="py-3 px-2">
                  <span className={builder.positive ? 'text-green-400' : 'text-red-400'}>
                    {builder.positive ? '+' : ''}{builder.change}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-300">{builder.amount}</td>
                <td className="py-3 px-2 text-right">
                  <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-gray-400 hover:text-white text-sm">
          Show next 20 Builders
        </button>
      </div>
    </div>
  );
};

// FIXME: Connect table to real builder data API
// FIXME: Implement sorting functionality for columns
// FIXME: Implement pagination for large datasets
// FIXME: Add real actions menu functionality