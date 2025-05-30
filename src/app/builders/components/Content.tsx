import React from 'react';

export const Content = () => {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-lg p-8 text-white relative overflow-hidden">
      <div className="absolute left-0 top-0 w-1/3 h-full">
        <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-500 opacity-80"></div>
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">BECOME A COLLECTIVE BUILDER.</h2>
          <h3 className="text-xl text-orange-100 mb-4">GET RICH AND FAMOUS</h3>
          <p className="text-orange-100 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas 
            dictum dignissim libero, eu imperdiet neque dignissim non.
          </p>
          <div className="flex space-x-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium">
              Become a Builder
            </button>
            <button className="border border-white/30 hover:bg-white/10 text-white px-6 py-2 rounded font-medium">
              Apply for a Grant
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">WHY BECOME A BUILDER?</h4>
          <ul className="space-y-2 text-orange-100">
            <li>• Lorem ipsum dolor sit amet</li>
            <li>• Consectetur adipiscing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// FIXME: Connect CTA buttons to actual registration/application flows
// FIXME: Make content dynamic/editable from CMS