import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applyPinataImageOptions, fetchIpfsNftMeta, ipfsGatewayUrl, defaultImageOptions } from './ipfs'

describe('IPFS Utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.NEXT_PUBLIC_IPFS_GATEWAY = 'gateway.pinata.cloud'
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_KEY = 'test-token'
  })

  describe('applyPinataImageOptions', () => {
    it('should apply image options to URL', () => {
      const url = applyPinataImageOptions('https://example.com/image.jpg', {
        width: 100,
        height: 100,
        quality: 80,
      })

      expect(url).toContain('img-width=100')
      expect(url).toContain('img-height=100')
      expect(url).toContain('img-quality=80')
      expect(url).toContain('pinataGatewayToken=test-token')
    })

    it('should use default options when no options provided', () => {
      const url = applyPinataImageOptions('https://example.com/image.jpg')

      // Check default values are included only if they exist
      Object.entries(defaultImageOptions).forEach(([key, value]) => {
        if (value !== undefined) {
          expect(url).toContain(`img-${key}=${value}`)
        } else {
          expect(url).not.toContain(`img-${key}`)
        }
      })

      expect(url).toContain('pinataGatewayToken=test-token')
    })

    it('should ignore undefined option values', () => {
      const url = applyPinataImageOptions('https://example.com/image.jpg', {
        width: 100,
        height: undefined,
        quality: undefined,
      })
      expect(url).toContain('img-width=100')
      expect(url).not.toContain('img-height')
      expect(url).not.toContain('img-quality')
    })

    it('should handle format options correctly', () => {
      const url = applyPinataImageOptions('https://example.com/image.jpg', {
        format: 'webp',
        fit: 'cover',
        dpr: 2,
      })
      expect(url).toContain('img-format=webp')
      expect(url).toContain('img-fit=cover')
      expect(url).toContain('img-dpr=2')
    })

    it('should handle special characters in URLs', () => {
      const url = applyPinataImageOptions('https://example.com/image with spaces.jpg', {
        width: 100,
      })
      expect(url).toContain('image%20with%20spaces.jpg')
      expect(url).toContain('img-width=100')
    })

    it('should throw when a non-url string was passed', () => {
      expect(() => applyPinataImageOptions('not-a-url')).toThrow()
    })

    it('should return empty string when falsy values are passed', () => {
      expect(applyPinataImageOptions('')).toBe('')
      expect(applyPinataImageOptions(undefined)).toBe('')
      expect(applyPinataImageOptions(null as unknown as string)).toBe('')
    })
  })

  describe('ipfsGatewayUrl', () => {
    it('should construct proper gateway URL', () => {
      const url = ipfsGatewayUrl('Qm123456')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/Qm123456')
    })

    it('should remove ipfs:// prefix', () => {
      const url = ipfsGatewayUrl('ipfs://Qm123456')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/Qm123456')
    })

    it('should return empty string if IPFS gateway is not defined', () => {
      process.env.NEXT_PUBLIC_IPFS_GATEWAY = ''
      expect(ipfsGatewayUrl('Qm123456')).toBe('')
    })

    it('should remove /ipfs/ prefix', () => {
      const url = ipfsGatewayUrl('/ipfs/Qm123456')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/Qm123456')
    })

    it('should handle empty CID', () => {
      const url = ipfsGatewayUrl('')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/')
    })

    it('should handle undefined CID', () => {
      const url = ipfsGatewayUrl(undefined as unknown as string)
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/')
    })

    it('should handle CID with file path', () => {
      const url = ipfsGatewayUrl('Qm123456/image.jpg')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/Qm123456/image.jpg')
    })
  })

  describe('fetchIpfsNftMeta', () => {
    it('should fetch NFT metadata successfully', async () => {
      const mockNftMeta = { name: 'Test NFT', description: 'Test Description' }
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNftMeta),
      })

      const result = await fetchIpfsNftMeta('Qm123456')
      expect(result).toEqual(mockNftMeta)
    })

    it('should throw error on failed fetch', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(fetchIpfsNftMeta('Qm123456')).rejects.toThrow('Failed to fetch IPFS data')
    })

    it('should throw error when json parsing fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(fetchIpfsNftMeta('Qm123456')).rejects.toThrow('Invalid JSON')
    })
  })
})
