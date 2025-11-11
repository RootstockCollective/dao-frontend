'use client'

interface CircularProgressProps {
  percentage: number
  className?: string
}

/**
 * Circular progress indicator that fills based on percentage
 * * This is used for the vaults.
 * * When design is finished, this should be removed.
 */
export const CircularProgress = ({ percentage, className = '' }: CircularProgressProps) => {
  const strokeWidth = 8
  const size = 100 // viewBox size
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative w-full max-w-[200px] aspect-square ${className}`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-v3-bg-accent-100 opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
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
        <span className="text-2xl font-bold text-v3-text-primary">{percentage.toFixed(2)}%</span>
        <span className="text-xs text-v3-text-secondary">of vault</span>
      </div>
    </div>
  )
}
