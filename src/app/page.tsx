'use client'
import { useConnection } from '@/app/store/useConnection'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Header/Logo'
import classNames from 'classnames'
import { useEffect } from 'react'
import { FaLink, FaUsers } from 'react-icons/fa'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-cover'

export default function Home() {
  const connection = useConnection()

  const handleConnectWallet = () => {
    connection.connect()
  }
  const handleExploreCommunities = () => {}

  useEffect(() => {
    connection.checkConnection()
  }, [connection])

  return (
    <div className={classNames(BACKGROUND_CLASSES, 'flex flex-col justify-center items-center h-screen')}>
      <Logo className="mb-8" />
      <div className="flex space-x-4">
        {!connection.isConnected && (
          <Button onClick={handleConnectWallet} variant="primary" startIcon={<FaLink />}>
            Connect wallet
          </Button>
        )}
        <Button onClick={handleExploreCommunities} variant="secondary" startIcon={<FaUsers />}>
          Explore Communities
        </Button>
      </div>
      <Footer />
    </div>
  )
}
