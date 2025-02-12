import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'
import { ComponentType, FC } from 'react'
import { useAccount } from 'wagmi'
import { BecomeABuilderButton } from './BecomeABuilderButton'

export const withBuilderButton = <P extends {}>(Component: ComponentType<P>): FC<P> => {
  const WrappedComponent = ({ ...props }: P) => {
    const { address } = useAccount()

    return (
      <div className="flex justify-between items-center self-stretch mb-6">
        <Component {...(props as P)} />
        <div className="flex gap-3 justify-end">
          <SelfContainedNFTBoosterCard />
          <BecomeABuilderButton address={address!} />
        </div>
      </div>
    )
  }

  WrappedComponent.displayName = `WithBuilderButton(${Component.displayName || Component.name})`

  return WrappedComponent
}
