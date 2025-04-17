import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetTimestamp = () => {
  const [timestamp, setTimestamp] = useState(BigInt(DateTime.now().toUnixInteger()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(DateTime.now().toUnixInteger()))
    }, AVERAGE_BLOCKTIME)

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [])

  return timestamp
}
