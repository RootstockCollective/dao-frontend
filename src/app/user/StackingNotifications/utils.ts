/**
 * Utility functions for StackingNotifications component
 */

export const handleActionClick = (content: { action: { external: boolean; url: string } }) => {
  if (content.action.external) {
    window.open(content.action.url, '_blank')
  } else {
    window.location.href = content.action.url
  }
}
