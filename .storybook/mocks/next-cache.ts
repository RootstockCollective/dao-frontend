/**
 * Replaces `next/cache` in the Storybook build (see `webpackFinal` in `.storybook/main.ts`).
 *
 * `@storybook/nextjs` ships its own `next/cache` mock, but it re-exports the real `unstable_cache`,
 * which reaches `next/dist/server/render-result.js`. Since Next.js 16 that file loads `node:stream`
 * behind a `process.env.TURBOPACK` check that webpack cannot resolve at build time, so any module
 * in a story's import graph that imports `next/cache` breaks the whole preview build with
 * `UnhandledSchemeError: Reading from "node:stream"`.
 *
 * Here `unstable_cache` is the identity: the wrapped function runs uncached, which is what a story
 * wants anyway. Add any other `next/cache` export here if `src/` starts importing it.
 */
import { fn } from 'storybook/test'

export const unstable_cache = <T extends (...args: never[]) => Promise<unknown>>(
  callback: T,
  _keyParts?: string[],
  _options?: { revalidate?: number | false; tags?: string[] },
): T => callback

export const revalidateTag = fn().mockName('next/cache::revalidateTag')
export const revalidatePath = fn().mockName('next/cache::revalidatePath')
export const unstable_noStore = fn().mockName('next/cache::unstable_noStore')

const nextCache = { unstable_cache, revalidateTag, revalidatePath, unstable_noStore }
export default nextCache
