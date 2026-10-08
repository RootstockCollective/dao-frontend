/** Builds a per-wallet localStorage key. Put anything else that scopes it (like the chain) in the prefix. */
export const getWalletStorageKey = (prefix: string, address: string) => `${prefix}-${address.toLowerCase()}`

/** JSON localStorage access that never throws: blocked, full or server-side storage reads as empty. */
export const safeStorage = {
  /** The parsed value, or undefined when missing or unreadable. Callers validate its shape. */
  get(key: string): unknown {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? undefined : JSON.parse(raw)
    } catch {
      return undefined
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors: the value just won't persist
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  },
}
