import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

import { useBlockTime } from '@/shared/context/BlockTimeContext'

export const useIntervalTimestamp = () => {
  const { averageBlockTimeMs } = useBlockTime()
  const [timestamp, setTimestamp] = useState(BigInt(DateTime.now().toUnixInteger()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(DateTime.now().toUnixInteger()))
    }, averageBlockTimeMs)

    return () => clearInterval(interval)
  }, [averageBlockTimeMs])

  return timestamp
}
