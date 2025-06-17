export interface FilterOption {
  id: number
  name: string
}

/**
 * Configuration array containing available proposal filter categories
 */
export const filterOptions = [
  { id: 0, name: 'All categories' },
  { id: 1, name: 'Grant' },
  { id: 2, name: 'Activation' },
  { id: 3, name: 'Wave 4' },
  { id: 4, name: 'Wave 5' },
  { id: 5, name: 'March-25' },
] as const satisfies FilterOption[]
