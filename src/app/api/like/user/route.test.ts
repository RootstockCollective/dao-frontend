import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth } from '@/lib/auth/session'

const mockSelect = vi.fn()
const mockWhere = vi.fn(() => ({ select: mockSelect }))
const mockDaoDataDb = Object.assign(
  vi.fn((_table: string) => ({ where: mockWhere })),
  {
    transaction: vi.fn(),
  },
)

vi.mock('@/lib/daoDataDb', () => ({
  daoDataDb: mockDaoDataDb,
}))

vi.mock('@/lib/auth/session', () => ({
  requireAuth: vi.fn(),
}))

const mockedRequireAuth = vi.mocked(requireAuth)

function createGetRequest(proposalId?: string): NextRequest {
  const url = proposalId
    ? `http://localhost/api/like/user?proposalId=${proposalId}`
    : 'http://localhost/api/like/user'
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/like/user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRequireAuth.mockResolvedValue({ userAddress: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' })
  })

  it("should return user's reactions when liked", async () => {
    mockSelect.mockResolvedValueOnce([{ reaction: 'heart' }])

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      proposalId: '123',
      reactions: ['heart'],
    })
  })

  it('should return empty array when not liked', async () => {
    mockSelect.mockResolvedValueOnce([])

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      proposalId: '123',
      reactions: [],
    })
  })

  it('should normalize userAddress to lowercase', async () => {
    mockSelect.mockResolvedValueOnce([])

    const { GET } = await import('./route')
    await GET(createGetRequest('123'))

    expect(mockWhere).toHaveBeenCalledWith({
      proposalId: expect.any(Buffer),
      userAddress: '0xabcdef0123456789abcdef0123456789abcdef01',
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

  it('should return 401 when not authenticated', async () => {
    mockedRequireAuth.mockRejectedValueOnce(new Error('Unauthorized'))

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })

  it('should return 500 on database error', async () => {
    mockSelect.mockRejectedValueOnce(new Error('DB connection lost'))

    const { GET } = await import('./route')
    const response = await GET(createGetRequest('123'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })
})

describe('GET /api/like/user (database not configured)', () => {
  it('should return 503 when database is not configured', async () => {
    vi.resetModules()
    vi.doMock('@/lib/daoDataDb', () => ({ daoDataDb: undefined }))
    vi.doMock('@/lib/auth/session', () => ({
      requireAuth: vi.fn().mockResolvedValue({
        userAddress: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01',
      }),
    }))

    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/like/user?proposalId=123', { method: 'GET' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database not configured')
  })
})
