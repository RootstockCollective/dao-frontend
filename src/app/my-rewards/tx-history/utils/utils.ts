export const formatExpandedDate = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return date.toLocaleString('en-US', options)
}
