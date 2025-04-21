import { ComponentType, FC } from 'react'
import { LoadingSpinner, SpinnerSize } from '@/components/LoadingSpinner'

type WithLoadingProps = {
  isLoading: boolean
}

type SpinnerOptions = {
  size?: SpinnerSize
}

export const withSpinner = <P extends {}>(
  Component: ComponentType<P>,
  className = '',
  options?: SpinnerOptions,
): FC<P & WithLoadingProps> => {
  const WrappedComponent = ({ isLoading, ...props }: WithLoadingProps) => (
    <>
      {isLoading ? (
        <LoadingSpinner className={className} size={options?.size} />
      ) : (
        <Component {...(props as P)} />
      )}
    </>
  )

  WrappedComponent.displayName = `WithSpinner(${Component.displayName || Component.name})`

  return WrappedComponent
}
