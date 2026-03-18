'use client'

import type { ComponentProps } from 'react'

import { LoadingSpinner } from '@/components/LoadingSpinner'

import { useRcNft } from './useRcNft'

/** Loading spinner that shows while contract read operations are in progress */
export function ContractsReadSpinner(props: ComponentProps<'div'>) {
  const { loading } = useRcNft()
  if (!loading) return null
  return (
    <div {...props}>
      <LoadingSpinner size="small" />
    </div>
  )
}
