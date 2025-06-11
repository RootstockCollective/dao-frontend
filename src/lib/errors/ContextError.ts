export class NoContextProviderError extends Error {
  constructor(contextName: string, providerName?: string) {
    super(`${contextName} must be used within ${providerName ?? `${contextName}Provider`}`)
    this.name = `${contextName}Error`
  }
}
