import { ComponentType, FC } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

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
