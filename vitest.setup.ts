import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

// Node 24.22+ ships the Web Storage globals unflagged, but without --localstorage-file they resolve to
// undefined. vitest's jsdom environment only copies window keys that are missing from the Node global, so
// jsdom's Storage never reaches the tests and `localStorage.clear()` throws. `frames` is copied verbatim and
// jsdom returns its real window from it, so take the Storage objects from there.
const jsdomWindow = (globalThis as { frames?: Window }).frames
if (jsdomWindow && jsdomWindow !== (globalThis as unknown as Window) && !globalThis.localStorage) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, { value: jsdomWindow[key], configurable: true, writable: true })
  }
}
