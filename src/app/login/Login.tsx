import { Footer } from '@/components/Footer'
import { Headline } from '@/components/Typography'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Disclaimer } from './Disclaimer'
import { GetStarted } from './GetStarted'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-auto bg-no-repeat bg-right'

export const Login = () => {
  const { isConnected, address } = useAccount()
  const [hasMounted, setHasMounted] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

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
    <div className={cn(BACKGROUND_CLASSES, 'flex flex-row h-screen justify-center items-center')}>
      <Header />
      <div className="flex-1 ml-20 mr-14">
        <Headline>{showDisclaimer ? 'DISCLAIMER' : 'GET STARTED'}</Headline>
        <div className="flex space-x-4 justify-center items-center">
          {hasMounted && (
            <>
              {isConnected ? (
                <p>Redirecting...</p>
              ) : showDisclaimer ? (
                <Disclaimer onConnect={() => router.push('/user')} />
              ) : (
                <GetStarted
                  onNext={() => setShowDisclaimer(true)}
                  onExploreCommunities={handleExploreCommunities}
                />
              )}
            </>
          )}
        </div>
        <div className="mt-2 text-center">{address}</div>
      </div>
      <div className="flex-1"></div>
      {hasMounted && <Footer />}
    </div>
  )
}

const Header = () => (
  <header className="absolute top-9 left-8">
    <Image
      src="/images/wordmark.svg"
      alt="Logo"
      width={0}
      height={0}
      style={{ width: '96px', height: 'auto' }}
    />
  </header>
)
