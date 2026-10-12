import { createHmac, hkdfSync, timingSafeEqual } from 'crypto'

import { getEncodedSecret } from './jwt.server'

export const CHALLENGE_TTL_MS = 4 * 60 * 1000

let _key: Buffer | null = null

// Own HKDF label so a challenge MAC can never stand in for a JWT signature
function getKey(): Buffer {
  if (!_key) {
    _key = Buffer.from(hkdfSync('sha256', getEncodedSecret(), '', 'siwe-challenge', 32))
  }
  return _key
}

function mac(payload: string): string {
  return createHmac('sha256', getKey()).update(payload).digest('base64url')
}

export function sealChallenge(message: string): string {
  const payload = Buffer.from(message, 'utf8').toString('base64url')
  return `${payload}.${mac(payload)}`
}

export function openChallenge(challenge: string): string | null {
  const parts = challenge.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payload, tag] = parts
  const expected = Buffer.from(mac(payload))
  const received = Buffer.from(tag)
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null
  }

  return Buffer.from(payload, 'base64url').toString('utf8')
}
