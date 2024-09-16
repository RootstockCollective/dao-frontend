'use client'
import { useAccount } from 'wagmi'
import { Login } from './login'
import User from './user/page'

export default function Home() {
  const { isConnected } = useAccount()
  if (isConnected) {
    return <User />
  }
  return <Login />
}
