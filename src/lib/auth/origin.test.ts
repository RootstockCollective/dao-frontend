import { describe, expect, it } from 'vitest'

import { assertSameOriginRequest, CrossOriginRequestError } from './origin'

const request = (headers: Record<string, string> = {}) =>
  new Request('https://app.rootstockcollective.xyz/api/like', { method: 'POST', headers })

describe('assertSameOriginRequest', () => {
  it('accepts a same-origin browser request', () => {
    expect(() =>
      assertSameOriginRequest(
        request({ 'sec-fetch-site': 'same-origin', origin: 'https://app.rootstockcollective.xyz' }),
      ),
    ).not.toThrow()
  })

  it('accepts a request from any host this app is deployed on', () => {
    expect(() =>
      assertSameOriginRequest(request({ origin: 'https://qa.dao.rootstockcollective.xyz' })),
    ).not.toThrow()
  })

  it('accepts a request without browser origin headers (curl, server-to-server)', () => {
    expect(() => assertSameOriginRequest(request())).not.toThrow()
  })

  it('rejects a sibling subdomain, which SameSite=Lax would still let through', () => {
    expect(() =>
      assertSameOriginRequest(
        request({ 'sec-fetch-site': 'same-site', origin: 'https://gov.rootstockcollective.xyz' }),
      ),
    ).toThrow(CrossOriginRequestError)
  })

  it('rejects a cross-site origin even when Sec-Fetch-Site is missing', () => {
    expect(() => assertSameOriginRequest(request({ origin: 'https://evil.example' }))).toThrow(
      CrossOriginRequestError,
    )
  })

  it('rejects an opaque "null" origin', () => {
    expect(() => assertSameOriginRequest(request({ origin: 'null' }))).toThrow(CrossOriginRequestError)
  })

  it('rejects a lookalike of a deployed host', () => {
    expect(() =>
      assertSameOriginRequest(request({ origin: 'https://app.rootstockcollective.xyz.evil.example' })),
    ).toThrow(CrossOriginRequestError)
  })

  it('does not trust Sec-Fetch-Site: same-origin when Origin says otherwise', () => {
    expect(() =>
      assertSameOriginRequest(request({ 'sec-fetch-site': 'same-origin', origin: 'https://evil.example' })),
    ).toThrow(CrossOriginRequestError)
  })
})
