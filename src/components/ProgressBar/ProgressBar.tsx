import React from 'react'

type Props = {
  progress: number // A number between 0 and 100
  color?: string
}

export const ProgressBar: React.FC<Props> = ({ progress, color }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
      <div
        className="h-2 rounded-full bg-neutral-600"
        style={{ width: `${progress}%`, backgroundColor: `${color}` }}
      ></div>
    </div>
  )
}
