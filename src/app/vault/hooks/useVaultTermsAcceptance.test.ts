import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVaultTermsAcceptance } from './useVaultTermsAcceptance'

const mocks = vi.hoisted(() => ({ address: undefined as string | undefined }))

vi.mock('wagmi', () => ({ useAccount: () => ({ address: mocks.address }) }))

const ADDRESS = '0x00000000000000000000000000000000000000Ab'
// The format already stored in holders' browsers
const STORED_KEY = 'vault-terms-acceptance-0x00000000000000000000000000000000000000ab'

const renderTerms = () => renderHook(() => useVaultTermsAcceptance()).result.current

describe('useVaultTermsAcceptance', () => {
  beforeEach(() => {
    mocks.address = ADDRESS
    localStorage.clear()
  })

  afterEach(cleanup)

  it('keeps an acceptance stored before the shared storage helper', () => {
    localStorage.setItem(STORED_KEY, 'true')

    expect(renderTerms().hasAcceptedTerms).toBe(true)
  })

  it('stores an acceptance in the same format', () => {
    renderTerms().acceptTerms()

    expect(localStorage.getItem(STORED_KEY)).toBe('true')
    expect(renderTerms().hasAcceptedTerms).toBe(true)
  })

  it('forgets the acceptance on reset', () => {
    renderTerms().acceptTerms()
    renderTerms().resetTermsAcceptance()

    expect(renderTerms().hasAcceptedTerms).toBe(false)
  })

  it('does not accept for another wallet or without one', () => {
    renderTerms().acceptTerms()

    mocks.address = '0x00000000000000000000000000000000000000cd'
    expect(renderTerms().hasAcceptedTerms).toBe(false)

    mocks.address = undefined
    expect(renderTerms().hasAcceptedTerms).toBe(false)
  })
})
