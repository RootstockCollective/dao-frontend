import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface WindshieldWiperAnimationProps extends CommonComponentProps {
  className?: string
  showAnimation?: boolean
  backgroundColor?: string
  animatedBackgroundColor?: string
  index?: number
}

const WINDSHIELD_WIPER_CLASSNAME =
  'absolute bottom-0 left-0 w-[200%] h-[200%] origin-bottom-left transform rounded-inherit pointer-events-none'

export const WindshieldWiperAnimation = ({
  children,
  className,
  showAnimation,
  backgroundColor,
  animatedBackgroundColor,
  index,
}: WindshieldWiperAnimationProps) => {
  // Animation delay multiplier in ms
  const DELAY_PER_INDEX = 1000 // ms
  const [show, setShow] = useState(false)

  // Only run effect if showAnimation changes or index changes
  useEffect(() => {
    if (!showAnimation) {
      setShow(false)
      return
    }

    const timeout = setTimeout(() => setShow(true), (index ?? 0) * DELAY_PER_INDEX)
    return () => clearTimeout(timeout)
  }, [showAnimation, index])

  return (
    <div className={cn('relative overflow-hidden rounded-inherit', backgroundColor, className)}>
      {showAnimation && show && (
        <>
          {/* First Sweep */}
          <div
            className={cn(
              WINDSHIELD_WIPER_CLASSNAME,
              'animate-[windshield-wiper-left-to-right_0.8s_linear_0.3s_forwards] z-2',
              backgroundColor,
            )}
          />
          {/* Second Sweep after delay */}
          <div
            className={cn(
              WINDSHIELD_WIPER_CLASSNAME,
              'animate-[windshield-wiper-left-to-right_0.8s_linear_1.3s_forwards] z-1',
              animatedBackgroundColor,
            )}
          />
        </>
      )}
      <div className="relative z-3 h-full">{children}</div>
    </div>
  )
}
