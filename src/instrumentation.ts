export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await require('pino')
    await require('next-logger')

    // Drain the PostHog server queue once on shutdown (container redeploys),
    // instead of calling shutdown() per request.
    const { getPostHogClient } = await import('@/lib/posthog-server')
    const drain = () => {
      getPostHogClient()
        .shutdown()
        .catch(() => {})
    }
    process.once('SIGTERM', drain)
    process.once('SIGINT', drain)
  }
}
