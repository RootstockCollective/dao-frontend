import dynamic from 'next/dynamic'

export const LoadingSpinner = dynamic(() => import('./LoadingSpinner'), { ssr: false })
