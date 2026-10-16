// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { openChallenge, sealChallenge } from './challengeToken'

const MESSAGE = 'app.rootstockcollective.xyz wants you to sign in with your Ethereum account'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('challengeToken', () => {
  it('opens a challenge it sealed', () => {
    expect(openChallenge(sealChallenge(MESSAGE))).toBe(MESSAGE)
  })

  it('rejects a challenge whose message was altered', () => {
    const [, tag] = sealChallenge(MESSAGE).split('.')
    const forged = Buffer.from(MESSAGE.replace('app.', 'evil.')).toString('base64url')

    expect(openChallenge(`${forged}.${tag}`)).toBeNull()
  })

  it('rejects a challenge whose MAC was altered', () => {
    const [payload, tag] = sealChallenge(MESSAGE).split('.')
    const flipped = (tag[0] === 'A' ? 'B' : 'A') + tag.slice(1)

    expect(openChallenge(`${payload}.${flipped}`)).toBeNull()
  })

  it('rejects malformed challenges', () => {
    expect(openChallenge('')).toBeNull()
    expect(openChallenge('a7c9e2f4-0b1d-4e8a-9c3f-2d6b8a0e4f17')).toBeNull()
    expect(openChallenge(`${sealChallenge(MESSAGE)}.extra`)).toBeNull()
  })

  it('rejects a challenge sealed under another secret', async () => {
    const challenge = sealChallenge(MESSAGE)

    vi.resetModules()
    vi.stubEnv('JWT_SECRET', 'another-secret')
    const { openChallenge: openWithAnotherSecret } = await import('./challengeToken')

    expect(openWithAnotherSecret(challenge)).toBeNull()
  })
})
