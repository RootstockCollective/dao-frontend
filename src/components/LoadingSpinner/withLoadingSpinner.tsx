import { ComponentType, FC } from 'react'
import { LoadingSpinner, SpinnerSize } from '@/components/LoadingSpinner'

type WithLoadingProps = {
  isLoading: boolean
}

type SpinnerOptions = {
  className?: string
  size?: SpinnerSize
}

export const withSpinner = <P extends {}>(
  Component: ComponentType<P>,
  options?: SpinnerOptions,
): FC<P & WithLoadingProps> => {
  const WrappedComponent = ({ isLoading, ...props }: WithLoadingProps) => (
    <>
      {isLoading ? (
        <LoadingSpinner className={options?.className} size={options?.size} />
      ) : (
        <Component {...(props as P)} />
      )}
    </>
  )

  WrappedComponent.displayName = `WithSpinner(${Component.displayName || Component.name})`

  return WrappedComponent
}
