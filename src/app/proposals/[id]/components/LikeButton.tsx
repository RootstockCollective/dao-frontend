import { Heart } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { useSignIn } from '@/shared/hooks/useSignIn'
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
    }

    toggleLike()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isToggling || isSigningIn}
      className="flex items-center gap-1.5 text-sm disabled:opacity-50 transition-opacity"
      aria-label={liked ? 'Unlike proposal' : 'Like proposal'}
    >
      <Heart size={18} className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
      <span className="text-white">{isLoading ? '...' : count}</span>
    </button>
  )
}
