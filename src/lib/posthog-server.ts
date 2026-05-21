import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient() {
  if (!posthogClient) {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    })
    const environment = process.env.NEXT_PUBLIC_PROFILE || 'unknown'
    const originalCapture = client.capture.bind(client)
    client.capture = params =>
      originalCapture({
        ...params,
        properties: { environment, ...params.properties },
      })
    posthogClient = client
  }
  return posthogClient
}
