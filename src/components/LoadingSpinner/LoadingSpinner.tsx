import { cn } from '@/lib/utils'
import Lottie from 'lottie-react'
// TODO: import loadingAnimation from 'path/to/loading.json' since the test fails
import loadingAnimation from '../../../public/loading.json'

const LoadingSpinner = ({ className = '' }) => (
  <div className={cn('flex justify-center', className)}>
    <Lottie animationData={loadingAnimation} className="w-1/2" loop={true} />
  </div>
)

export default LoadingSpinner
