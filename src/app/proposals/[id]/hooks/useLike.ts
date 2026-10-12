import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { selectIsAuthenticated, selectUserAddress, useSiweStore } from '@/lib/auth/siweStore'

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
const userReactionQueryKey = (proposalId: string, userAddress: string | null) => [
  'proposalUserReaction',
  proposalId,
  userAddress,
]

// The auth-token cookie can be gone or expired while the persisted session still looks valid.
const forgetSessionIfRejected = (response: Response) => {
  if (response.status === 401) {
    useSiweStore.getState().clearSession()
  }
}

const fetchUserReaction = async (proposalId: string): Promise<UserReactionResponse> => {
  const response = await fetch(`/api/like/user?proposalId=${proposalId}`)
  forgetSessionIfRejected(response)
  if (!response.ok) throw new Error('Failed to fetch user reaction')
  return response.json()
}

/**
 * useLike — manages the like/heart state for a proposal.
 *
 * Handles the full lifecycle on a single click:
 * 1. Triggers SIWE sign-in when needed (wallet connected but no session)
 * 2. Fetches user's existing reaction before deciding to like or show existing state
 * 3. Sends the like/unlike request with optimistic UI updates
 * 4. Rolls back on failure
 * 5. Resets heart state on disconnect/logout
 * 6. Guards against concurrent toggle requests
 *
 * Background effects:
 * - Syncs user reaction from server when a session becomes available (e.g. page load with a persisted session)
 * - Keeps local count in sync with server count on refetch
 * - Clears liked state on disconnect/logout so heart shows unfilled
 */
export const useLike = (proposalId: string, isConnected: boolean, signIn: () => Promise<boolean>) => {
  const queryClient = useQueryClient()
  const isAuthenticated = useSiweStore(selectIsAuthenticated)
  const userAddress = useSiweStore(selectUserAddress)
  const [isToggling, setIsToggling] = useState(false)
  const [count, setCount] = useState(0)
  const [lastLikedState, setLastLikedState] = useState<boolean | null>(null)

  // Ref to always call the latest signIn without re-creating toggleLike
  const signInRef = useRef(signIn)
  signInRef.current = signIn

  // Like count query (always active, no auth required)
  const { data, isLoading } = useQuery<LikeApiResponse>({
    queryKey: likeQueryKey(proposalId),
    queryFn: async () => {
      const response = await fetch(`/api/like?proposalId=${proposalId}`)
      if (!response.ok) throw new Error('Failed to fetch likes')
      return response.json()
    },
    enabled: !!proposalId,
  })

  // User's own reaction query (only when authenticated)
  const { data: userReactionData } = useQuery<UserReactionResponse>({
    queryKey: userReactionQueryKey(proposalId, userAddress),
    queryFn: () => fetchUserReaction(proposalId),
    enabled: !!proposalId && isAuthenticated,
  })

  // Sync server-side user reaction into local state (only when uninitialized)
  useEffect(() => {
    if (lastLikedState !== null) return
    if (!userReactionData?.success) return
    setLastLikedState(userReactionData.reactions.includes('heart'))
  }, [userReactionData, lastLikedState])

  // Sync server count into local state
  const serverCount = data?.reactions?.heart ?? 0
  useEffect(() => {
    setCount(serverCount)
  }, [serverCount])

  // Reset liked state on disconnect or logout
  useEffect(() => {
    if (!isAuthenticated || !isConnected) {
      setLastLikedState(null)
    }
  }, [isAuthenticated, isConnected])

  const toggleLike = useCallback(async () => {
    if (isToggling) return
    setIsToggling(true)

    try {
      // Phase 1: Ensure we have a session
      if (!selectIsAuthenticated(useSiweStore.getState())) {
        const signedIn = await signInRef.current()
        if (!signedIn) return // Sign-in failed or user rejected
      }
      const userAddress = selectUserAddress(useSiweStore.getState())

      // Phase 2: If like status is unknown, fetch it before deciding
      let currentLikedState = lastLikedState
      if (currentLikedState === null) {
        try {
          const reactionData = await fetchUserReaction(proposalId)
          const alreadyLiked = reactionData.success && reactionData.reactions.includes('heart')
          if (alreadyLiked) {
            // Already liked — sync UI without sending another like request
            setLastLikedState(true)
            queryClient.invalidateQueries({ queryKey: likeQueryKey(proposalId) })
            queryClient.invalidateQueries({
              queryKey: userReactionQueryKey(proposalId, userAddress),
            })
            return
          }
          currentLikedState = false
        } catch {
          // Fetch failed — assume not liked and proceed with like
          currentLikedState = false
        }
      }

      // Phase 3: Optimistic update
      const willLike = !currentLikedState
      setCount(prev => Math.max(0, prev + (willLike ? 1 : -1)))
      setLastLikedState(willLike)

      // Phase 4: Send toggle request
      try {
        const response = await fetch('/api/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proposalId, reaction: 'heart' }),
        })
        forgetSessionIfRejected(response)

        const result: ToggleLikeResponse = await response.json()

        if (!response.ok || !result.success) {
          // Rollback optimistic update
          setCount(prev => Math.max(0, prev + (willLike ? -1 : 1)))
          setLastLikedState(currentLikedState)
          return
        }

        // Confirm with server state
        setLastLikedState(result.liked)
        queryClient.invalidateQueries({ queryKey: likeQueryKey(proposalId) })
        queryClient.invalidateQueries({
          queryKey: userReactionQueryKey(proposalId, userAddress),
        })
      } catch {
        // Network error — rollback optimistic update
        setCount(prev => Math.max(0, prev + (willLike ? -1 : 1)))
        setLastLikedState(currentLikedState)
      }
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
