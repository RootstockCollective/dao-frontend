export async function register() {
  // Server-side Sentry init is intentionally disabled (DAO-1955).
  // Server errors are logged via console.error for Grafana.
  // Client-side Sentry remains active via instrumentation-client.ts.
}
