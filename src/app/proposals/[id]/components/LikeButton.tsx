import { Heart } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { useSignIn } from '@/shared/hooks/useSignIn'
import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { Button } from '@/components/Button/Button'
import { SiweTooltipContent } from './SiweTooltipContent'
import { useLike } from '../hooks/useLike'

interface LikeButtonProps {
  proposalId: string
}

export const LikeButton = ({ proposalId }: LikeButtonProps) => {
  const { isConnected } = useAccount()
  const { onConnectWalletButtonClick } = useAppKitFlow()
  const { signIn, isAuthenticated, isLoading: isSigningIn } = useSignIn()
  const { count, liked, isLoading, isToggling, toggleLike } = useLike(proposalId, isConnected, signIn)

  const isBusy = isLoading || isToggling || isSigningIn

  const handleClick = () => {
    if (isBusy) return

    if (!isConnected) {
      onConnectWalletButtonClick()
      return
    }

    // toggleLike handles everything: sign-in if needed → fetch reaction → like/unlike
    toggleLike()
  }

  return (
    <ConditionalTooltip
      className="p-0"
      conditionPairs={[
        {
          condition: () => !isConnected,
          lazyContent: () => (
            <ConnectTooltipContent onClick={onConnectWalletButtonClick}>
              Connect your wallet to like proposals
            </ConnectTooltipContent>
          ),
        },
        {
          condition: () => !isAuthenticated,
          lazyContent: () => <SiweTooltipContent onClick={handleClick} />,
        },
      ]}
    >
      <Button
        variant="transparent"
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-sm transition-opacity self-start p-0 w-auto font-normal ${isBusy ? 'opacity-50' : ''}`}
        aria-label={liked ? 'Unlike proposal' : 'Like proposal'}
      >
        <Heart
          size={18}
          className={`${liked ? 'text-primary fill-primary' : 'text-white'} ${isToggling ? 'animate-like-pop' : ''}`}
        />
        <span className="text-white">{isLoading ? '...' : count}</span>
      </Button>
    </ConditionalTooltip>
  )
}
