export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Sanitizes error messages for production to prevent information leakage.
 * Returns generic error messages in production, detailed messages in development.
 */
export function sanitizeError(message: string): string {
  if (isProduction) {
    // Request validation errors
    if (message.includes('Invalid address')) return 'Invalid request'
    if (message.includes('Missing host')) return 'Invalid request'

    // Token/authentication errors
    if (message.includes('Missing token')) return 'Authentication required'
    if (message.includes('Invalid challenge')) return 'Authentication failed'
    if (message.includes('Invalid signature')) return 'Authentication failed'
    if (message.includes('Invalid or expired')) return 'Authentication failed'
    if (message.includes('expired')) return 'Authentication failed'
    if (message.includes('verification failed')) return 'Authentication failed'

    return 'Authentication failed'
  }
  return message
}
