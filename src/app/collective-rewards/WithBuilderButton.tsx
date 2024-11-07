import { ComponentType, FC } from 'react'
import { BecomeABuilderButton } from '@/app/collective-rewards/BecomeABuilderButton'
import { useAccount } from 'wagmi'

export const withBuilderButton = <P extends {}>(Component: ComponentType<P>): FC<P> => {
  const WrappedComponent = ({ ...props }: P) => {
    const { address } = useAccount()
    return (
      <div className="flex justify-between items-center self-stretch mb-6">
        <Component {...(props as P)} />
        <BecomeABuilderButton address={address!} />
      </div>
    )
  }

  WrappedComponent.displayName = `WithBuilderButton(${Component.displayName || Component.name})`

  return WrappedComponent
}
