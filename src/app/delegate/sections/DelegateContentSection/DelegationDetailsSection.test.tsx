import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DelegateContextProvider } from '@/app/delegate/contexts/DelegateContext'
import { DelegateContentSection } from '@/app/delegate/sections/DelegateContentSection/DelegateContentSection'
import { DENIED_DELEGATE_MESSAGE } from '@/app/delegate/lib/utils'

const { DENIED, HOLDER } = vi.hoisted(() => ({
  DENIED: '0x17296956b4E07Ff8931E4ff4eA06709FaB70b879',
  HOLDER: '0x' + 'a'.repeat(40),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => require('react').createElement('img', props),
}))

vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<object>()),
  DELEGATES_DENYLIST: [DENIED.toLowerCase()],
}))

vi.mock('@/app/user/Delegation/server/fetchNftHoldersWithVotingPower', () => ({
  getCachedNftHoldersShepherds: async () => [],
}))

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  const empty = { data: undefined, isLoading: false, refetch: vi.fn() }
  return {
    ...actual,
    useAccount: () => ({ address: HOLDER, isConnected: true }),
    useWriteContract: () => ({ writeContractAsync: vi.fn(), isPending: false }),
    useReadContract: (request: { functionName?: string } | false | undefined) => {
      if (!request || typeof request !== 'object') return empty
      if (request.functionName === 'delegates') return { ...empty, data: DENIED }
      if (request.functionName === 'balanceOf' || request.functionName === 'getVotes') {
        return { ...empty, data: 10n * 10n ** 18n }
      }
      if (request.functionName === 'totalSupply') return { ...empty, data: 100n * 10n ** 18n }
      return empty
    },
  }
})

// The browser's only name lookup for the current delegatee.
const fetchMock = vi.fn(async (input: RequestInfo) => {
  const url = String(input)
  if (url.startsWith('/api/rns/')) {
    return Response.json({ ens_domain_name: 'curia.rsk' })
  }
  if (url.startsWith('/api/contributors/')) return Response.json([])
  if (url.startsWith('/api/delegated-votes/')) return Response.json({ totalDelegatedVotes: '0' })
  return new Response(null, { status: 404 })
})

describe('current delegate on the denylist', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('warns a holder whose on-chain delegate is denylisted', async () => {
    vi.stubGlobal('fetch', fetchMock)

    render(
      <DelegateContextProvider>
        <DelegateContentSection />
      </DelegateContextProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'curia.rsk' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reclaim' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`/api/rns/${DENIED}`))
    expect(screen.getByText(DENIED_DELEGATE_MESSAGE)).toBeInTheDocument()
  })
})
