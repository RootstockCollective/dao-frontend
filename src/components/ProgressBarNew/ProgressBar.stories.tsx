import { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'
import { useState } from 'react'

export default {
  title: 'Components/Progress/Bar',
  component: ProgressBar,
} as Meta<typeof ProgressBar>

type Story = StoryObj<typeof ProgressBar>

const progress = [5, 10, 30, 50, 80, 90, 100]

export const Static: Story = {
  render: () => {
    const [index, setIndex] = useState(0)
    const progressValue = progress[index % progress.length]
    return (
      <div className="w-fit">
        <div className="flex justify-between">
          <button
            className="px-2 mb-2 border rounded-sm border-neutral-500"
            onClick={() => setIndex(val => val + 1)}
          >
            Go to next value
          </button>
          <p>Current progress: {progressValue}</p>
        </div>
        <ProgressBar progress={progressValue} />
      </div>
    )
  },
}
