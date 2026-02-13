/**
 * Server-side challenge store for SIWE authentication
 *
 * Stores SIWE challenges in memory with automatic TTL cleanup.
 * Challenges are single-use and expire after 4 minutes.
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

/**
 * Challenge time-to-live in milliseconds
 * Used for both SIWE message expiration and challenge storage TTL
 */
export const CHALLENGE_TTL_MS = 4 * 60 * 1000 // 4 minutes

/**
 * Maximum number of challenges to store in memory
 * Estimated memory usage: ~4 MB (386 bytes per challenge)
 * With 4-minute TTL, would need 2,500 login attempts/minute to hit this limit
 */
const MAX_CHALLENGES = 10000

/**
 * Counter for challenges created since last cleanup
 */
let challengesSinceCleanup = 0

/**
 * Run cleanup every N challenges
 */
const CLEANUP_INTERVAL = 20

/**
 * Cleanup expired challenges from the store
 * Called automatically every CLEANUP_INTERVAL challenges
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
 * Enforce max challenges limit by removing oldest entries (FIFO)
 * Called when the map size exceeds MAX_CHALLENGES
 */
function enforceMaxLimit(): void {
  if (challenges.size >= MAX_CHALLENGES) {
    // Remove oldest entries (first entries in the Map)
    const entriesToRemove = challenges.size - MAX_CHALLENGES + 1
    let removed = 0
    for (const [id] of challenges) {
      challenges.delete(id)
      removed++
      if (removed >= entriesToRemove) {
        break
      }
    }
  }
}

/**
 * Store a challenge and return its unique ID
 * @param challenge - The challenge data to store
 * @returns The unique challenge ID
 */
export function storeChallenge(challenge: Omit<StoredChallenge, 'expiresAt'>): string {
  // Clean up expired challenges every CLEANUP_INTERVAL challenges
  challengesSinceCleanup++
  if (challengesSinceCleanup >= CLEANUP_INTERVAL) {
    cleanup()
    challengesSinceCleanup = 0
  }

  // Enforce maximum challenges limit to prevent memory exhaustion
  enforceMaxLimit()

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
 *
 * IMPORTANT: This function uses a check-and-delete pattern to prevent race conditions.
 * The Map.delete() returns false if the key doesn't exist, ensuring atomicity.
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

  // Delete the challenge (single-use) and verify it wasn't already consumed
  // If delete returns false, the challenge was already consumed by another request
  if (!challenges.delete(id)) {
    return null // Already consumed or doesn't exist
  }

  return challenge
}
