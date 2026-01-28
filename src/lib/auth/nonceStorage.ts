import { cookies } from 'next/headers'

const NONCE_COOKIE_NAME = 'auth-nonces'
const NONCE_EXPIRATION_MS = 60 * 1000 // 1 minute

interface NonceData {
  expiresAt: number
}

interface NoncesMap {
  [nonce: string]: NonceData
}

/**
 * Get all nonces from the cookie
 */
async function getNoncesFromCookie(): Promise<NoncesMap> {
  const cookieStore = await cookies()
  const noncesCookie = cookieStore.get(NONCE_COOKIE_NAME)

  if (!noncesCookie?.value) {
    return {}
  }

  try {
    return JSON.parse(noncesCookie.value) as NoncesMap
  } catch {
    return {}
  }
}

/**
 * Save nonces to the cookie
 */
async function saveNoncesToCookie(nonces: NoncesMap): Promise<void> {
  const cookieStore = await cookies()
  const now = Date.now()

  // Clean up expired nonces before saving
  const activeNonces: NoncesMap = {}
  for (const [nonce, data] of Object.entries(nonces)) {
    if (data.expiresAt > now) {
      activeNonces[nonce] = data
    }
  }

  cookieStore.set(NONCE_COOKIE_NAME, JSON.stringify(activeNonces), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60, // 1 minute (same as nonce expiration)
    path: '/',
  })
}

/**
 * Store a nonce in the cookie with 1 minute expiration
 */
export async function storeNonce(nonce: string): Promise<void> {
  const now = Date.now()
  const expiresAt = now + NONCE_EXPIRATION_MS

  const nonces = await getNoncesFromCookie()
  nonces[nonce] = { expiresAt }
  await saveNoncesToCookie(nonces)
}

/**
 * Validate and consume a nonce
 * Returns true if nonce exists and hasn't expired, then deletes it
 * Returns false if nonce doesn't exist or has expired
 */
export async function validateAndConsumeNonce(nonce: string): Promise<boolean> {
  const now = Date.now()
  const nonces = await getNoncesFromCookie()

  const nonceData = nonces[nonce]

  if (!nonceData) {
    return false // Nonce doesn't exist
  }

  if (nonceData.expiresAt < now) {
    // Nonce expired, remove it
    delete nonces[nonce]
    await saveNoncesToCookie(nonces)
    return false
  }

  // Nonce is valid, delete it (single-use)
  delete nonces[nonce]
  await saveNoncesToCookie(nonces)
  return true
}

/**
 * Clean up expired nonces
 * Should be called periodically to prevent cookie bloat
 */
export async function cleanupExpiredNonces(): Promise<void> {
  const nonces = await getNoncesFromCookie()
  await saveNoncesToCookie(nonces) // saveNoncesToCookie already cleans up expired nonces
}
