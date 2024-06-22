import { JSX, FC } from 'react'
const DEFAULT_CLASSES = 'w-100 rounded-[6px] bg-white h-[6px] rounded-[20px] relative flex overflow-hidden'

type Value = {
  value: number
  color: JSX.IntrinsicElements['div']['color']
}

interface Props {
  values: Value[]
}

export const ComparativeProgressBar: FC<Props> = ({ values }) => {
  const total = values.reduce((acc, { value }) => acc + value, 0)

  return (
    <div className={DEFAULT_CLASSES}>
      {values.map(({ value, color }, index) => {
        const percentage = (value / total) * 100
        return (
          <div
            key={index}
            style={{ width: `${percentage}%`, height: '6px', backgroundColor: color }}
          ></div>
        )
      })}
    </div>
  )
}
