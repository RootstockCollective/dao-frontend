/**
 * Utility functions for StackingNotifications component
 *
 * This module contains helper functions for handling banner actions and other
 * utility operations related to the notification banner system.
 */

/**
 * Handles the click action for banner buttons.
 *
 * This function determines whether to open an external link in a new tab
 * or navigate to an internal route within the same application.
 *
 * @param content - Banner configuration object containing action details
 * @param content.action - Action configuration
 * @param content.action.external - Whether the link is external (true) or internal (false)
 * @param content.action.url - The target URL (internal route or external link)
 *
 * @example
 * ```typescript
 * // External link - opens in new tab
 * handleActionClick({
 *   action: { external: true, url: 'https://exchange.example.com' }
 * })
 *
 * // Internal route - navigates in same tab
 * handleActionClick({
 *   action: { external: false, url: '/user?action=stake' }
 * })
 * ```
 */
export const handleActionClick = (content: { action: { external: boolean; url: string } }) => {
  if (content.action.external) {
    // Open external links in a new tab/window
    window.open(content.action.url, '_blank')
  } else {
    // Navigate to internal routes within the same application
    window.location.href = content.action.url
  }
}
