import { DecorativeSquares } from '@/app/backing/components/DecorativeSquares'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '@/components/commonProps'

export interface StackableBannerProps extends CommonComponentProps {
  children: ReactNode | ReactNode[]
  background?: string
  decorativeImageColor?: string
  testId?: string
}

export const StackableBanner: FC<StackableBannerProps> = ({
  children,
  className = '',
  background = 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)',
  decorativeImageColor = '#d2fbf6',
  testId = 'StackableBanner',
}) => {
  // Convert children to array if it's not already
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div
      className={cn('relative self-stretch py-6 px-10 text-v3-text-0', className)}
      style={{
        background,
      }}
      data-testid={testId}
    >
      <DecorativeSquares className="absolute left-0 top-[-30px] z-20" color={decorativeImageColor} />

      <div
        className={cn(
          'relative flex flex-col items-start text-v3-text-0 divide-y divide-v3-bg-accent-100/10',
        )}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="w-full py-6 first:pt-0 last:pb-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StackableBanner
