import React, { useEffect, useState } from 'react'
import { isMobileOrTablet } from '@/lib/utils'

const DeviceWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check if the user is on a mobile or tablet device
    if (isMobileOrTablet()) {
      setShowWarning(true)
    }
  }, [])

  if (!showWarning) {
    return null // Don't render anything if not mobile or tablet
  }

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-500 text-white text-center font-bold p-4">
      For the best experience, please use a computer or laptop.
    </div>
  )
}

export { DeviceWarning }
