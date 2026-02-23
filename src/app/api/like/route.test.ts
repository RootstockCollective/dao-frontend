import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth } from '@/lib/auth/session'

const mockPrisma = {
  proposalLike: {
    groupBy: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma)),
}

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/auth/session', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/app/proposals/actions/getProposalById', () => ({
  confirmProposalExists: vi.fn().mockResolvedValue(true),
}))

const mockedRequireAuth = vi.mocked(requireAuth)

function createRequest(body?: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/like', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRequireAuth.mockResolvedValue({ userAddress: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' })
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma),
    )
  })

  it('should return 200 with liked: true when inserting a new reaction', async () => {
    mockPrisma.proposalLike.findFirst.mockResolvedValueOnce(null)

    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, liked: true, reaction: 'heart' })
    expect(mockPrisma.proposalLike.create).toHaveBeenCalledWith({
      data: {
        proposalId: expect.any(Uint8Array),
        userAddress: '0xabcdef0123456789abcdef0123456789abcdef01',
        reaction: 'heart',
      },
    })
  })

  it('should return 200 with liked: false when toggling an existing reaction', async () => {
    mockPrisma.proposalLike.findFirst.mockResolvedValueOnce({
      id: 42,
      proposalId: Buffer.alloc(32),
      userAddress: '0x',
      reaction: 'heart',
    })

    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, liked: false, reaction: 'heart' })
    expect(mockPrisma.proposalLike.delete).toHaveBeenCalledWith({ where: { id: 42 } })
  })

  it('should return 400 when proposalId is missing', async () => {
    const { POST } = await import('./route')
    const response = await POST(createRequest({ reaction: 'heart' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 when proposalId is not a valid BigInt', async () => {
    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: 'not-a-number' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 when reaction is invalid', async () => {
    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123', reaction: 'thumbsup' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 401 when not authenticated', async () => {
    mockedRequireAuth.mockRejectedValueOnce(new Error('Unauthorized'))

    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123' }))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('DB connection lost'))

    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123' }))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })

  it('should normalize userAddress to lowercase', async () => {
    mockPrisma.proposalLike.findFirst.mockResolvedValueOnce(null)

    const { POST } = await import('./route')
    await POST(createRequest({ proposalId: '123' }))

    expect(mockPrisma.proposalLike.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userAddress: '0xabcdef0123456789abcdef0123456789abcdef01',
        }),
      }),
    )
  })

  it('should default reaction to heart when not provided', async () => {
    mockPrisma.proposalLike.findFirst.mockResolvedValueOnce(null)

    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '456' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true, liked: true, reaction: 'heart' })
    expect(mockPrisma.proposalLike.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reaction: 'heart' }),
      }),
    )
  })
})

describe('POST /api/like (database not configured)', () => {
  it('should return 503 when database is not configured', async () => {
    vi.resetModules()
    vi.doMock('@/lib/prisma', () => ({ prisma: undefined }))
    vi.doMock('@/lib/auth/session', () => ({
      requireAuth: vi.fn().mockResolvedValue({
        userAddress: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01',
      }),
    }))
    const { POST } = await import('./route')
    const response = await POST(createRequest({ proposalId: '123' }))
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database not configured')
  })
})

describe('GET /api/like', () => {
  function createGetRequest(proposalId?: string): NextRequest {
    const url = proposalId
      ? `http://localhost/api/like?proposalId=${proposalId}`
      : 'http://localhost/api/like'
    return new NextRequest(url, { method: 'GET' })
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }))
    vi.doMock('@/lib/auth/session', () => ({ requireAuth: vi.fn() }))
    vi.doMock('@/app/proposals/actions/getProposalById', () => ({
      confirmProposalExists: vi.fn().mockResolvedValue(true),
    }))
  })

  it('should return 200 with aggregated reaction counts', async () => {
    mockPrisma.proposalLike.groupBy.mockResolvedValueOnce([
      { reaction: 'heart', _count: { _all: 5 } },
    ])

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      proposalId: '123',
      reactions: { heart: 5 },
    })
    expect(mockPrisma.proposalLike.groupBy).toHaveBeenCalledWith({
      by: ['reaction'],
      where: { proposalId: expect.any(Uint8Array) },
      _count: { _all: true },
    })
  })

  it('should return 200 with empty reactions when proposal has no likes', async () => {
    mockPrisma.proposalLike.groupBy.mockResolvedValueOnce([])

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('999'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      proposalId: '999',
      reactions: {},
    })
  })

  it('should return 200 with multiple reaction types', async () => {
    mockPrisma.proposalLike.groupBy.mockResolvedValueOnce([
      { reaction: 'heart', _count: { _all: 3 } },
      { reaction: 'thumbsup', _count: { _all: 7 } },
    ])

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('456'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      proposalId: '456',
      reactions: { heart: 3, thumbsup: 7 },
    })
  })

  it('should return 400 when proposalId is missing', async () => {
    const { GET } = await import('./route')
    const response = await GET(createGetRequest())
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 when proposalId is not a valid BigInt', async () => {
    const { GET } = await import('./route')
    const response = await GET(createGetRequest('not-a-number'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 500 on database error', async () => {
    mockPrisma.proposalLike.groupBy.mockRejectedValueOnce(new Error('DB connection lost'))

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })
})

describe('GET /api/like (database not configured)', () => {
  it('should return 503 when database is not configured', async () => {
    vi.resetModules()
    vi.doMock('@/lib/prisma', () => ({ prisma: undefined }))
    vi.doMock('@/lib/auth/session', () => ({ requireAuth: vi.fn() }))
    vi.doMock('@/app/proposals/actions/getProposalById', () => ({
      confirmProposalExists: vi.fn().mockResolvedValue(true),
    }))

    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/like?proposalId=123', { method: 'GET' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database not configured')
  })
})
