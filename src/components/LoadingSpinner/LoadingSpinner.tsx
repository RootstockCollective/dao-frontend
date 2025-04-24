import { cn } from '@/lib/utils'
import { SpinnerSize } from '.'

export type LoadingSpinnerProps = {
  className?: string
  size?: SpinnerSize
}

const LoadingSpinner = ({ className = '', size = 'responsive' }: LoadingSpinnerProps) => {
  // Define size classes based on the size prop
  let sizeClass = ''

  if (size === 'responsive') {
    // Responsive sizing - will adapt to parent container
    sizeClass = 'w-full h-full max-w-full max-h-full'
  } else if (typeof size === 'number') {
    // If size is a number, use it directly as pixel value
    sizeClass = `h-[${size}px] w-[${size}px]`
  } else {
    // Use predefined sizes
    switch (size) {
      case 'small':
        sizeClass = 'h-10 w-10'
        break
      case 'large':
        sizeClass = 'h-24 w-24'
        break
      case 'medium':
      default:
        sizeClass = 'h-20 w-20'
        break
    }
  }

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <svg
        className={`animate-spin ${sizeClass} text-indigo-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export default LoadingSpinner
