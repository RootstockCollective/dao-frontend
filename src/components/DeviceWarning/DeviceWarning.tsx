'use client'

import React from 'react'

export const DeviceWarning = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex justify-center items-center z-50 pointer-events-auto">
      <div className="text-white text-center font-bold p-6 rounded-md max-w-md w-full">
        <p className="text-xl">For the best experience, please use a computer or laptop.</p>
        <br />
        <p className="mt-4 text-sm font-thin">
          Explore our resources at{' '}
          <a
            href="https://rootstockcollective.xyz/"
            className="text-[#E56B1A] underline  font-bold"
            target="_blank"
          >
            Rootstock Collective
          </a>
          .
        </p>
      </div>
    </div>
  )
}
