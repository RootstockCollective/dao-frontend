import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

/**
 * Recent Node versions ship their own experimental Web Storage, so `localStorage` and
 * `sessionStorage` already sit on globalThis before jsdom is installed. Vitest only copies a
 * window property onto the global when the global does not already have it, so a bare
 * `localStorage` in a test resolves to Node's implementation, which is undefined unless the
 * process was started with `--localstorage-file`.
 *
 * Under jsdom, vitest points `window` back at globalThis and hands the real jsdom window over
 * as `globalThis.jsdom`, so that is where both storages have to be read from.
 */
const jsdomWindow: Window | undefined = (globalThis as { jsdom?: { window: Window } }).jsdom?.window

if (jsdomWindow) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      enumerable: true,
      get: () => jsdomWindow[key],
    })
  }
}
