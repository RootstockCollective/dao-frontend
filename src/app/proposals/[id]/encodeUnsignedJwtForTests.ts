/**
 * Builds an unsigned JWT-shaped string decodable by jose `decodeJwt` (Vitest only; signature not verified).
 */
export function encodeUnsignedJwtForTests(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.x`
}

const defaultTestUserAddress = '0x0000000000000000000000000000000000000001'

/**
 * JWT with `exp` set to now + offset in seconds (negative → already expired).
 */
export function testJwtExpiringInSeconds(
  secondsFromNow: number,
  userAddress: string = defaultTestUserAddress,
): string {
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow
  return encodeUnsignedJwtForTests({ exp, userAddress })
}
