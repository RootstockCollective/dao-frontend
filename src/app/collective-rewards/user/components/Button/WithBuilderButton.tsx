import { ComponentType, FC } from 'react'
import { BecomeABuilderButton } from './BecomeABuilderButton'
import { useAccount } from 'wagmi'
import { NFTBoosterCard } from '@/app/shared/components'

export const withBuilderButton = <P extends {}>(Component: ComponentType<P>): FC<P> => {
  const WrappedComponent = ({ ...props }: P) => {
    const { address } = useAccount()
    return (
      <div className="flex justify-between items-center self-stretch mb-6">
        <Component {...(props as P)} />
        <div className="flex gap-3 justify-end">
          {/* FIXME: get the nft booster context and check if there is an active campaign and the user owns the related NFT */}
          {/* <NFTBoosterCard boostValue={20} nftThumbPath="" title="HI" /> */}
          <BecomeABuilderButton address={address!} />
        </div>
      </div>
    )
  }

  WrappedComponent.displayName = `WithBuilderButton(${Component.displayName || Component.name})`

  return WrappedComponent
}
