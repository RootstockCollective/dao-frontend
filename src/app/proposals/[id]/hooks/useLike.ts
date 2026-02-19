import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useSiweStore } from '@/lib/auth/siweStore'

interface LikeApiResponse {
  success: boolean
  proposalId: string
  reactions: Record<string, number>
}

interface UserReactionResponse {
  success: boolean
  proposalId: string
  reactions: string[]
}

interface ToggleLikeResponse {
  success: boolean
  liked: boolean
  reaction: string
}

const likeQueryKey = (proposalId: string) => ['proposalLikes', proposalId]
const userReactionQueryKey = (proposalId: string, jwtToken: string) => [
  'proposalUserReaction',
  proposalId,
  jwtToken,
]

export const useLike = (proposalId: string) => {
  const queryClient = useQueryClient()
  const jwtToken = useSiweStore(state => state.jwtToken)
  const [isToggling, setIsToggling] = useState(false)
  const [count, setCount] = useState(0)
  const [lastLikedState, setLastLikedState] = useState<boolean | null>(null)

  const { data, isLoading } = useQuery<LikeApiResponse>({
    queryKey: likeQueryKey(proposalId),
    queryFn: async () => {
      const response = await fetch(`/api/like?proposalId=${proposalId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch likes')
      }
      return response.json()
    },
    enabled: !!proposalId,
  })

  const { data: userReactionData } = useQuery<UserReactionResponse>({
    queryKey: userReactionQueryKey(proposalId, jwtToken ?? ''),
    queryFn: async () => {
      const response = await fetch(`/api/like/user?proposalId=${proposalId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user reaction')
      }
      return response.json()
    },
    enabled: !!proposalId && !!jwtToken,
  })

  // Sync server-side user reaction into local state (only when uninitialized)
  useEffect(() => {
    if (lastLikedState !== null) return
    if (!userReactionData?.success) return
    const hasHeart = userReactionData.reactions.includes('heart')
    setLastLikedState(hasHeart)
  }, [userReactionData, lastLikedState])

  // Sync server count into local state
  const serverCount = data?.reactions?.heart ?? 0
  useEffect(() => {
    setCount(serverCount)
  }, [serverCount])

  // Reset liked state on logout
  useEffect(() => {
    if (!jwtToken) {
      setLastLikedState(null)
    }
  }, [jwtToken])

  const toggleLike = useCallback(async () => {
    if (isToggling) return

    setIsToggling(true)

    // Read token directly from store to avoid stale closure after signIn
    const currentToken = useSiweStore.getState().jwtToken

    const willLike = lastLikedState === null ? true : !lastLikedState
    setCount(prev => Math.max(0, prev + (willLike ? 1 : -1)))
    setLastLikedState(willLike)

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        },
        body: JSON.stringify({ proposalId, reaction: 'heart' }),
      })

      const result: ToggleLikeResponse = await response.json()

      if (!response.ok || !result.success) {
        setCount(prev => Math.max(0, prev + (willLike ? -1 : 1)))
        setLastLikedState(willLike ? (lastLikedState === null ? null : lastLikedState) : lastLikedState)
        return
      }

      setLastLikedState(result.liked)
      queryClient.invalidateQueries({ queryKey: likeQueryKey(proposalId) })
      if (currentToken) {
        queryClient.invalidateQueries({ queryKey: userReactionQueryKey(proposalId, currentToken) })
      }
    } catch {
      setCount(prev => Math.max(0, prev + (willLike ? -1 : 1)))
      setLastLikedState(willLike ? (lastLikedState === null ? null : lastLikedState) : lastLikedState)
    } finally {
      setIsToggling(false)
    }
  }, [isToggling, lastLikedState, proposalId, queryClient])

  return {
    count,
    liked: lastLikedState ?? false,
    isLoading,
    isToggling,
    toggleLike,
  }
}
