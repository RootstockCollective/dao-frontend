import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { ConnectButton } from '@/components/Header'
import { Logo } from '@/components/Header/Logo'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-auto bg-no-repeat bg-right'

export const Login = () => {
  const { isConnected, address } = useAccount()
  const [hasMounted, setHasMounted] = useState(false)

  const router = useRouter()

  const handleExploreCommunities = () => router.push('/communities')

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  useEffect(() => {
    // Redirect the user to /user if connected
    if (isConnected) {
      router.push('/user')
    }
  }, [isConnected, router])

  return (
    <div className={cn(BACKGROUND_CLASSES, 'flex flex-col justify-center items-center h-screen')}>
      <Logo className="mb-8" textClassName="text-6xl" />
      <div className="flex space-x-4">
        {hasMounted && (
          <>
            {isConnected ? (
              <div className="flex flex-col items-center">
                <p>Redirecting...</p>
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <ConnectButton onSuccess={() => router.push('/user')} />
                <Button onClick={handleExploreCommunities} variant="secondary" startIcon={<FaUsers />}>
                  Explore Communities
                </Button>
              </>
            )}
          </>
        )}
      </div>
      <div className="mt-2">{address}</div>
      <Footer />
    </div>
  )
}
