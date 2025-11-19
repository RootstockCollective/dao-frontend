'use client'

interface CircularProgressProps {
  percentage: number
  className?: string
  size?: 'small' | 'default'
}

/**
 * Circular progress indicator that fills based on percentage
 * * This is used for the vaults.
 * * When design is finished, this should be removed.
 */
export const CircularProgress = ({ percentage, className = '', size = 'default' }: CircularProgressProps) => {
  const strokeWidth = size === 'small' ? 4 : 8
  const viewBoxSize = 100 // viewBox size
  const radius = (viewBoxSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const isSmall = size === 'small'
  const containerClasses = isSmall
    ? `relative w-16 h-16 ${className}`
    : `relative w-full max-w-[200px] aspect-square ${className}`

  return (
    <div className={containerClasses}>
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-v3-bg-accent-100 opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-v3-primary transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={
            isSmall ? 'text-xs font-bold text-v3-text-primary' : 'text-2xl font-bold text-v3-text-primary'
          }
        >
          {percentage.toFixed(2)}%
        </span>
        {!isSmall && <span className="text-xs text-v3-text-secondary">of vault</span>}
      </div>
    </div>
  )
}
