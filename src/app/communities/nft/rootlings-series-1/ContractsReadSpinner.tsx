'use client'

import type { ComponentProps } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRootlingsS1 } from './useRootlingsS1'

export function ContractsReadSpinner(props: ComponentProps<'div'>) {
  const { loading } = useRootlingsS1()
  if (!loading) return null
  return (
    <div {...props}>
      <LoadingSpinner size="small" />
    </div>
  )
}
