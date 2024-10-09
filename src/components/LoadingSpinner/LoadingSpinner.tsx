import { cn } from '@/lib/utils'
import Lottie from 'lottie-react'
import loadingAnimation from '@/public/loading.json'
import { ComponentType, FC } from 'react'

const LoadingSpinner = ({ className = '' }) => (
  <div className={cn('flex justify-center', className)}>
    <Lottie animationData={loadingAnimation} className="w-1/2" loop={true} />
  </div>
)

export default LoadingSpinner

type WithLoadingProps = {
  isLoading: boolean
}

export const withSpinner = <P extends {}>(Component: ComponentType<P>): FC<P & WithLoadingProps> => {
  const WrappedComponent = ({ isLoading, ...props }: WithLoadingProps) => (
    <>{isLoading ? <LoadingSpinner /> : <Component {...(props as P)} />}</>
  )

  WrappedComponent.displayName = `WithSpinner(${Component.displayName || Component.name})`

  return WrappedComponent
}
