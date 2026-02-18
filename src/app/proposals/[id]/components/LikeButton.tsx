import { Heart } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { useSignIn } from '@/shared/hooks/useSignIn'
import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { SiweTooltipContent } from './SiweTooltipContent'
import { useLike } from '../hooks/useLike'

interface LikeButtonProps {
  proposalId: string
}

export const LikeButton = ({ proposalId }: LikeButtonProps) => {
  const { isConnected } = useAccount()
  const { onConnectWalletButtonClick } = useAppKitFlow()
  const { signIn, isAuthenticated, isLoading: isSigningIn } = useSignIn()
  const { count, liked, isLoading, isToggling, toggleLike } = useLike(proposalId)

  const handleClick = async () => {
    if (!isConnected) {
      onConnectWalletButtonClick()
      return
    }

    if (!isAuthenticated) {
      const token = await signIn()
      if (!token) return
      // Return after sign-in to let the user reaction query sync the
      // current like state from the server before allowing a toggle.
      // Without this, toggleLike assumes no prior like and may invert the state.
      return
    }

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
      <button
        onClick={handleClick}
        disabled={isLoading || isToggling || isSigningIn}
        className="flex items-center gap-1.5 text-sm disabled:opacity-50 transition-opacity self-start"
        aria-label={liked ? 'Unlike proposal' : 'Like proposal'}
      >
        <Heart size={18} className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
        <span className="text-white">{isLoading ? '...' : count}</span>
      </button>
    </ConditionalTooltip>
  )
}
