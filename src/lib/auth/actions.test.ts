// @vitest-environment node
// Server-only module: jose rejects jsdom's cross-realm Uint8Array when signing JWTs
import { SiweMessage } from 'siwe'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { requestChallenge, verifySignature } from './actions'
import { CHALLENGE_TTL_MS, sealChallenge } from './challengeToken'

const TRUSTED_HOST = 'app.rootstockcollective.xyz'
const account = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('requestChallenge', () => {
  it('binds the message to the trusted host', async () => {
    const { message } = await requestChallenge(account.address, TRUSTED_HOST)
    const parsed = new SiweMessage(message)

    expect(parsed.domain).toBe(TRUSTED_HOST)
    expect(parsed.uri).toBe(`http://${TRUSTED_HOST}`)
  })

  it('refuses to issue a challenge for an untrusted Host header', async () => {
    await expect(requestChallenge(account.address, 'untrusted.example')).rejects.toThrow(/Untrusted domain/)
  })

  it('still rejects invalid input', async () => {
    await expect(requestChallenge('not-an-address', TRUSTED_HOST)).rejects.toThrow(/Invalid address/)
    await expect(requestChallenge(account.address, '')).rejects.toThrow(/Missing host/)
  })
})

describe('verifySignature', () => {
  it('issues a token for a signature over the server-issued message', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
    const signature = await account.signMessage({ message })

    const { token } = await verifySignature(challengeId, signature)

    expect(token).toEqual(expect.any(String))
  })

  it('rejects a signature over a message from another domain', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)

    // A signature produced over a message for a different domain must not be
    // redeemable against our challenge
    const otherDomainMessage = message.replace(TRUSTED_HOST, 'other.example')
    const signature = await account.signMessage({ message: otherDomainMessage })

    await expect(verifySignature(challengeId, signature)).rejects.toThrow(/verification failed/)
  })

  it('consumes the challenge so a signature cannot be replayed', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
    const signature = await account.signMessage({ message })

    await verifySignature(challengeId, signature)

    await expect(verifySignature(challengeId, signature)).rejects.toThrow(/Invalid or expired challenge/)
  })

  it('rejects a challenge whose domain is no longer served', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
    const signature = await account.signMessage({ message })

    // Deployment is reconfigured between issuance and redemption
    vi.stubEnv('SIWE_ALLOWED_DOMAINS', 'dao.example.org')

    await expect(verifySignature(challengeId, signature)).rejects.toThrow(/Untrusted domain/)
  })

  it('rejects a challenge the server did not seal', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
    const [, tag] = challengeId.split('.')
    const altered = message.replace(/Nonce: .*/, 'Nonce: alterednonce1')
    const signature = await account.signMessage({ message: altered })

    const forged = `${Buffer.from(altered).toString('base64url')}.${tag}`

    await expect(verifySignature(forged, signature)).rejects.toThrow(/Invalid or expired challenge/)
  })

  it('rejects a sealed challenge that outlives the challenge TTL', async () => {
    const { message } = await requestChallenge(account.address, TRUSTED_HOST)
    const extended = message.replace(/Expiration Time: .*/, 'Expiration Time: 2999-01-01T00:00:00.000Z')
    const signature = await account.signMessage({ message: extended })

    await expect(verifySignature(sealChallenge(extended), signature)).rejects.toThrow(
      /Invalid or expired challenge/,
    )
  })

  it('rejects a sealed challenge for another chain', async () => {
    const { message } = await requestChallenge(account.address, TRUSTED_HOST)
    const otherChain = message.replace(/Chain ID: .*/, 'Chain ID: 1')
    const signature = await account.signMessage({ message: otherChain })

    await expect(verifySignature(sealChallenge(otherChain), signature)).rejects.toThrow(
      /Invalid or expired challenge/,
    )
  })

  it('rejects an expired challenge', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
      const signature = await account.signMessage({ message })

      vi.setSystemTime(Date.now() + CHALLENGE_TTL_MS)

      await expect(verifySignature(challengeId, signature)).rejects.toThrow(/Invalid or expired challenge/)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not let a failed attempt burn the challenge', async () => {
    const { challengeId, message } = await requestChallenge(account.address, TRUSTED_HOST)
    const otherAccount = privateKeyToAccount(generatePrivateKey())

    await expect(verifySignature(challengeId, await otherAccount.signMessage({ message }))).rejects.toThrow(
      /verification failed/,
    )

    const { token } = await verifySignature(challengeId, await account.signMessage({ message }))
    expect(token).toEqual(expect.any(String))
  })

  it('validates the signature format before touching the store', async () => {
    await expect(verifySignature('some-id', 'not-a-signature')).rejects.toThrow(/Invalid signature format/)
    await expect(verifySignature('', '0xdeadbeef')).rejects.toThrow(/Invalid challenge ID/)
  })
})

describe('environment', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts the local dev host outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { requestChallenge: request } = await import('./actions')

    const { message } = await request(account.address, 'localhost:3000')

    expect(new SiweMessage(message).domain).toBe('localhost')
  })
})
