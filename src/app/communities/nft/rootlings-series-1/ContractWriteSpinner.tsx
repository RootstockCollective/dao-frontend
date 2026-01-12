'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRootlingsS1 } from './useRootlingsS1'

/** Loading spinner overlay that shows during contract write operations. */
export function ContractWriteSpinner() {
  const { pending } = useRootlingsS1()

  if (!pending) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-base">
      <LoadingSpinner />
    </div>
  )
}
