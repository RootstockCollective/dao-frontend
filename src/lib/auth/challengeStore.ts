// An entry must outlive its challenge, or the same signature could be redeemed again
const redeemed = new Map<string, number>()

export function redeemChallenge(nonce: string, expiresAt: number): boolean {
  const now = Date.now()
  // Expiry is capped at CHALLENGE_TTL_MS, so stopping at the first live entry bounds the map
  for (const [key, expiry] of redeemed) {
    if (expiry > now) {
      break
    }
    redeemed.delete(key)
  }

  if (redeemed.has(nonce)) {
    return false
  }

  redeemed.set(nonce, expiresAt)
  return true
}
