/**
 * Server-side challenge store for SIWE authentication
 *
 * Stores SIWE challenges in memory with automatic TTL cleanup.
 * Challenges are single-use and expire after 1 minute.
 *
 * Note: This is an in-memory store, so challenges are lost on server restart.
 * For production horizontal scaling, consider using Redis or similar.
 */

interface StoredChallenge {
  message: string
  address: string
  expiresAt: number
}

const challenges = new Map<string, StoredChallenge>()
const CHALLENGE_TTL_MS = 60 * 1000 // 1 minute

/**
 * Cleanup expired challenges from the store
 * Called automatically on store operations
 */
function cleanup(): void {
  const now = Date.now()
  for (const [id, challenge] of challenges) {
    if (challenge.expiresAt < now) {
      challenges.delete(id)
    }
  }
}

/**
 * Store a challenge and return its unique ID
 * @param challenge - The challenge data to store
 * @returns The unique challenge ID
 */
export function storeChallenge(challenge: Omit<StoredChallenge, 'expiresAt'>): string {
  cleanup() // Clean up expired challenges on write

  const id = crypto.randomUUID()
  challenges.set(id, {
    ...challenge,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  })

  return id
}

/**
 * Retrieve and consume a challenge (single-use)
 * @param id - The challenge ID to retrieve
 * @returns The stored challenge, or null if not found or expired
 */
export function getAndConsumeChallenge(id: string): StoredChallenge | null {
  const challenge = challenges.get(id)

  if (!challenge) {
    return null
  }

  // Check if expired
  if (challenge.expiresAt < Date.now()) {
    challenges.delete(id)
    return null
  }

  // Delete the challenge (single-use)
  challenges.delete(id)

  return challenge
}

/**
 * Get the current number of active challenges (for debugging/monitoring)
 */
export function getChallengeCount(): number {
  cleanup()
  return challenges.size
}
