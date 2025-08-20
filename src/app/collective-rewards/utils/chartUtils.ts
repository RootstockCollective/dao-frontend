export const toDate = (d: Date | number | string): Date => (d instanceof Date ? d : new Date(d))

export const convertToTimestamp = (d: Date | number | string): number => toDate(d).getTime()

export const formatShort = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)} B`
  if (abs >= 1_000_000) return `${Math.round(n / 1_000_000)} M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)} K`
  return `${n.toLocaleString()}`
}

export const bigToNum = (v: number | bigint | undefined): number =>
  typeof v === 'bigint' ? Number(v) : Number(v ?? 0)
