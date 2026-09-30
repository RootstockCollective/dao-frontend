import { useState } from 'react'

const readDismissed = (storageKey: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

// Kept in sessionStorage so a dismissed banner stays away when the page remounts, until the tab closes
export const useSessionDismissals = (storageKey: string) => {
  const [dismissed, setDismissed] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readDismissed(storageKey),
  )

  const dismiss = (id: string) => {
    if (dismissed.includes(id)) return
    const next = [...dismissed, id]
    setDismissed(next)
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Storage blocked: the dismissal lasts until the page remounts
    }
  }

  return { isDismissed: (id: string) => dismissed.includes(id), dismiss }
}
