import dynamic from 'next/dynamic'

export const LoadingSpinner = dynamic(() => import('./LoadingSpinner'), { ssr: false })
export type SpinnerSize = 'small' | 'medium' | 'large' | number | 'responsive'
