import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

interface WindshieldWiperAnimationProps extends CommonComponentProps {
  className?: string
  showAnimation?: boolean
  backgroundColor?: string
  animatedBackgroundColor?: string
}

const WINDSHIELD_WIPER_CLASSNAME =
  'absolute bottom-0 left-0 w-[200%] h-[200%] origin-bottom-left transform rounded-inherit pointer-events-none'

export const WindshieldWiperAnimation = ({
  children,
  className,
  showAnimation,
  backgroundColor,
  animatedBackgroundColor,
}: WindshieldWiperAnimationProps) => {
  return (
    <div className={cn('relative overflow-hidden rounded-inherit', backgroundColor, className)}>
      {showAnimation && (
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
