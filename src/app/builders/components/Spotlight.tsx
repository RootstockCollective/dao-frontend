import React from 'react';

export const Spotlight = () => {
  const spotlightBuilders = [
    { name: 'Beefy', rewards: '50%', amount: '300.00 USD' },
    { name: 'Beefy', rewards: '50%', amount: '300.00 USD' },
    { name: 'Beefy', rewards: '50%', amount: '300.00 USD' },
    { name: 'Beefy', rewards: '50%', amount: '300.00 USD' },
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-6 text-white">IN THE SPOTLIGHT</h3>
      <div className="grid grid-cols-4 gap-6">
        {spotlightBuilders.map((builder, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-red-400 rounded-full"></div>
              </div>
            </div>
            <h4 className="text-orange-400 font-semibold text-lg mb-2">{builder.name}</h4>
            <div className="text-gray-400 text-sm mb-1">Rewards: {builder.rewards}</div>
            <div className="text-white font-semibold mb-4">{builder.amount}</div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
              Back Builder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// FIXME: Connect to real spotlight data
// FIXME: Implement backing functionality