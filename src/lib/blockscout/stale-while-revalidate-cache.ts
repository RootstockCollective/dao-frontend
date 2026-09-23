export interface StaleWhileRevalidateOptions {
  /** How long a value is served without any refresh. */
  freshMs: number
  /** How long a value may still be served while a refresh runs in the background. */
  staleMs: number
  /** Soft cap on retained entries; oldest insertions are dropped first. */
  maxEntries: number
  /**
   * When false, every call goes straight to the loader.
   * Defaults to off under `NODE_ENV === 'test'` so unrelated suites observe each loader call;
   * pass it explicitly to exercise caching behaviour in tests.
   */
  enabled?: boolean
}

interface CacheEntry<T> {
  value: T
  storedAt: number
}

export class StaleWhileRevalidateCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>()
  private readonly inFlight = new Map<string, Promise<T>>()
  private readonly refreshing = new Set<string>()
  private readonly enabled: boolean

  constructor(private readonly options: StaleWhileRevalidateOptions) {
    this.enabled = options.enabled ?? process.env.NODE_ENV !== 'test'
  }

  /**
   * Returns the cached value for `key`, refreshing via `loader` according to the policy above.
   *
   * @param key — Must fully identify the upstream query; nothing else is used for equality.
   * @param loader — Called at most once per key at a time.
   * @param onBackgroundError — Notified when a background refresh fails (the stale value is kept).
   */
  async getOrLoad(
    key: string,
    loader: () => Promise<T>,
    onBackgroundError?: (err: unknown) => void,
  ): Promise<T> {
    if (!this.enabled) {
      return loader()
    }

    const entry = this.entries.get(key)
    const age = entry ? Date.now() - entry.storedAt : Number.POSITIVE_INFINITY

    // Strict `<` so a zero window means "never fresh" / "never serve stale" rather than
    // "fresh for the rest of this millisecond".
    if (entry && age < this.options.freshMs) {
      return entry.value
    }

    if (entry && age < this.options.staleMs) {
      this.refreshInBackground(key, loader, onBackgroundError)
      return entry.value
    }

    try {
      return await this.load(key, loader)
    } catch (err) {
      if (entry) {
        // Expired but present: prefer stale history over failing the caller.
        onBackgroundError?.(err)
        return entry.value
      }
      throw err
    }
  }

  private load(key: string, loader: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key)
    if (existing) {
      return existing
    }

    const promise = loader()
      .then(value => {
        this.set(key, value)
        return value
      })
      .finally(() => {
        this.inFlight.delete(key)
      })

    this.inFlight.set(key, promise)
    return promise
  }

  private refreshInBackground(
    key: string,
    loader: () => Promise<T>,
    onBackgroundError?: (err: unknown) => void,
  ): void {
    if (this.refreshing.has(key) || this.inFlight.has(key)) {
      return
    }

    this.refreshing.add(key)
    void this.load(key, loader)
      .catch(err => onBackgroundError?.(err))
      .finally(() => this.refreshing.delete(key))
  }

  private set(key: string, value: T): void {
    this.entries.delete(key)
    this.entries.set(key, { value, storedAt: Date.now() })

    while (this.entries.size > this.options.maxEntries) {
      const oldestKey = this.entries.keys().next().value
      if (oldestKey === undefined) {
        break
      }
      this.entries.delete(oldestKey)
    }
  }

  /** Drops every entry. Intended for tests. */
  clear(): void {
    this.entries.clear()
    this.inFlight.clear()
    this.refreshing.clear()
  }
}
