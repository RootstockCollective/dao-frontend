import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { ConnectButton } from '@/components/Header'
import { Logo } from '@/components/Header/Logo'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaLink, FaUsers } from 'react-icons/fa6'
import { useAccount, useDisconnect } from 'wagmi'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-cover'

export const Login = () => {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const [hasMounted, setHasMounted] = useState(false)

  const router = useRouter()

  const handleExploreCommunities = () => router.push('/communities')

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  return (
    <div className={cn(BACKGROUND_CLASSES, 'flex flex-col justify-center items-center h-screen')}>
      <Logo className="mb-8" textClassName="text-6xl" />
      <div className="flex space-x-4">
        {hasMounted && (
          <>
            {isConnected ? (
              <Button
                onClick={() => disconnect()}
                variant="secondary"
                className="border-red-600"
                textClassName="text-red-600"
                startIcon={<FaLink />}
              >
                Disconnect
              </Button>
            ) : (
              <ConnectButton onSuccess={() => router.push('/user')} />
            )}

            <Button onClick={handleExploreCommunities} variant="secondary" startIcon={<FaUsers />}>
              Explore Communities
            </Button>
          </>
        )}
      </div>
      <div className="mt-2">{address}</div>
      <Footer />
    </div>
  )
}
