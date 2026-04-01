import * as matchers from '@testing-library/jest-dom/matchers'
import { expect, vi } from 'vitest'

expect.extend(matchers)

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}))

vi.mock('next/server', async importOriginal => {
  const mod = await importOriginal<typeof import('next/server')>()
  return {
    ...mod,
    connection: vi.fn(() => Promise.resolve()),
  }
})
