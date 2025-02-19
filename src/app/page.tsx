'use client'
import { useAccount } from 'wagmi'
import { Login } from './login'
import User from './user/page'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isConnected } = useAccount()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  if (isConnected) {
    return <User />
  }
  return <Login />
}
