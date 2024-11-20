'use client'

import React from 'react'

export const DeviceWarning = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex justify-center items-center z-50 pointer-events-auto">
      <div className="text-white text-center font-bold p-6 rounded-md max-w-md w-full">
        <p className="text-xl">For the best experience, please use a computer or laptop.</p>
      </div>
    </div>
  )
}
