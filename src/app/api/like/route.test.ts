import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const { mockSession, mockDaoDataDbRef } = vi.hoisted(() => ({
  mockSession: { userAddress: '0x1234567890123456789012345678901234567890' },
  mockDaoDataDbRef: { current: undefined as unknown },
}))

const createQueryBuilder = (existingLike: { id: number } | undefined) => {
  const qb = {
    withSchema: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(existingLike),
    delete: vi.fn().mockResolvedValue(1),
    insert: vi.fn().mockResolvedValue([1]),
  }
  return qb
}

const createMockDb = (existingLike: { id: number } | undefined) => {
  const tableQb = createQueryBuilder(existingLike)
  const trx = vi.fn().mockReturnValue(tableQb)
  return {
    transaction: vi.fn().mockImplementation(async (fn: (t: typeof trx) => Promise<unknown>) => {
      return fn(trx)
    }),
  }
}

vi.mock('@/lib/auth/session', () => ({
  requireAuth: vi.fn().mockResolvedValue(mockSession),
}))

vi.mock('@/lib/daoDataDb', () => ({
  get daoDataDb() {
    return mockDaoDataDbRef.current
  },
}))

describe('POST /api/like', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 when daoDataDb is not configured', async () => {
    mockDaoDataDbRef.current = undefined
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: '1', reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database not configured')
  })

  it('inserts row and returns liked: true when user has no existing like', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: '42', reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      success: true,
      liked: true,
      userAddress: '0x1234567890123456789012345678901234567890',
    })
  })

  it('deletes row and returns liked: false when user already has like', async () => {
    mockDaoDataDbRef.current = createMockDb({ id: 1 })
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: '42', reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      success: true,
      liked: false,
      userAddress: '0x1234567890123456789012345678901234567890',
    })
  })

  it('returns 400 when proposalId is missing', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('returns 400 when proposalId is invalid (non-numeric)', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: 'abc', reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid proposalId')
  })

  it('defaults reaction to heart when omitted', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: '1' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.liked).toBe(true)
  })

  it('returns 400 when body is invalid JSON', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid JSON body')
  })

  it('returns 400 when body is not an object', async () => {
    mockDaoDataDbRef.current = createMockDb(undefined)
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('string'),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Request body must be an object')
  })

  it('returns 500 when database throws', async () => {
    const mockDb = createMockDb(undefined)
    mockDaoDataDbRef.current = mockDb
    mockDb.transaction.mockRejectedValueOnce(new Error('Connection refused'))
    const req = new Request('http://localhost/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: '1', reaction: 'heart' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })
})
