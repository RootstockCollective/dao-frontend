import { Footer } from '@/components/Footer'
import { Headline } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Disclaimer } from './Disclaimer'
import { GetStarted } from './GetStarted'
import { BG_IMG_CLASSES } from '@/shared/utils'
import { HeaderText } from '@/components/HeaderText/HeaderText'
import { DeviceWarning } from '@/components/DeviceWarning'

export const Login = () => {
  const { isConnected, address } = useAccount()
  const [hasMounted, setHasMounted] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [isMobile, setIsMobile] = useState(false) // State to track mobile devices

  const router = useRouter()

  const handleExploreCommunities = () => router.push('/communities')

  useEffect(() => {
    // Prevent hydration error on client-side because useAccount hook is not available on the server-side
    setHasMounted(true)

    // Check if the device is mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640) // Tailwind's sm breakpoint
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize) // Add resize event listener

    return () => {
      window.removeEventListener('resize', handleResize) // Cleanup listener on unmount
    }
  }, [])

  useEffect(() => {
    // Redirect the user to /user if connected
    if (isConnected) {
      router.push('/user?tab=holdings')
    }
  }, [isConnected, router])

  return (
    <div className={cn(BG_IMG_CLASSES, 'flex flex-row h-screen justify-center items-center bg-black')}>
      <HeaderText />

      {/* Conditionally render DeviceWarning for mobile */}
      {isMobile && <DeviceWarning />}

      <div className="flex-1 ml-20 mr-14">
        <Headline>{showDisclaimer ? 'DISCLAIMER' : 'GET STARTED'}</Headline>
        <div className="flex space-x-4 justify-center items-center">
          {hasMounted && (
            <>
              {isConnected ? (
                <p>Redirecting...</p>
              ) : showDisclaimer ? (
                <Disclaimer
                  onConnect={() => router.push('/user?tab=holdings')}
                  onCancel={() => setShowDisclaimer(false)}
                />
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
