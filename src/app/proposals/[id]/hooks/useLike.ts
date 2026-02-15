import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useSiweStore } from '@/lib/auth/siweStore'

interface LikeApiResponse {
  success: boolean
  proposalId: string
  reactions: Record<string, number>
}

interface ToggleLikeResponse {
  success: boolean
  liked: boolean
  reaction: string
}

const likeQueryKey = (proposalId: string) => ['proposalLikes', proposalId]

export const useLike = (proposalId: string) => {
  const queryClient = useQueryClient()
  const jwtToken = useSiweStore(state => state.jwtToken)
  const [isToggling, setIsToggling] = useState(false)
  const [optimisticDelta, setOptimisticDelta] = useState(0)
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

  // Reset liked state on logout
  useEffect(() => {
    if (!jwtToken) {
      setLastLikedState(null)
    }
  }, [jwtToken])

  const serverCount = data?.reactions?.heart ?? 0
  const count = serverCount + optimisticDelta

  const toggleLike = useCallback(async () => {
    if (isToggling) return

    setIsToggling(true)

    const willLike = lastLikedState === null ? true : !lastLikedState
    setOptimisticDelta(prev => prev + (willLike ? 1 : -1))
    setLastLikedState(willLike)

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify({ proposalId, reaction: 'heart' }),
      })

      const result: ToggleLikeResponse = await response.json()

      if (!response.ok || !result.success) {
        setOptimisticDelta(prev => prev + (willLike ? -1 : 1))
        setLastLikedState(willLike ? (lastLikedState === null ? null : lastLikedState) : lastLikedState)
        return
      }

      setLastLikedState(result.liked)
      setOptimisticDelta(0)
      queryClient.invalidateQueries({ queryKey: likeQueryKey(proposalId) })
    } catch {
      setOptimisticDelta(prev => prev + (willLike ? -1 : 1))
      setLastLikedState(willLike ? (lastLikedState === null ? null : lastLikedState) : lastLikedState)
    } finally {
      setIsToggling(false)
    }
  }, [isToggling, lastLikedState, proposalId, queryClient, jwtToken])

  return {
    count: Math.max(0, count),
    liked: lastLikedState ?? false,
    isLoading,
    isToggling,
    toggleLike,
  }
}
