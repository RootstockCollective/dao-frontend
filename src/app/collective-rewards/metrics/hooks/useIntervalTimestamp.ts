import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useIntervalTimestamp = () => {
  const [timestamp, setTimestamp] = useState(BigInt(DateTime.now().toUnixInteger()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(DateTime.now().toUnixInteger()))
    }, AVERAGE_BLOCKTIME)

    return () => clearInterval(interval)
  }, [])

  return timestamp
}
