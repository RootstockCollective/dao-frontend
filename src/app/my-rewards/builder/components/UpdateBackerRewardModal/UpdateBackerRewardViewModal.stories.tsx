import React, { useState } from 'react'
import UpdateBackerRewardModal from './UpdateBackerRewardViewModal'
import { Duration } from 'luxon'

// Reusable story wrapper component
const StoryWrapper = ({
  isTxPending = false,
  cooldownDuration,
  currentReward,
  updatedReward,
  suggestedReward,
  onSave,
  onRewardChange,
  ...args
}: {
  isTxPending?: boolean
  cooldownDuration?: Duration
  currentReward: number
  updatedReward: number
  suggestedReward?: number
  onSave?: (reward: string) => void
  onRewardChange: (reward: string) => void
  [key: string]: any
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8 min-h-screen bg-black flex flex-col items-center justify-center">
      <button onClick={() => setOpen(true)}>Open Modal</button>
      {open && (
        <UpdateBackerRewardModal
          currentReward={currentReward}
          updatedReward={updatedReward}
          suggestedReward={suggestedReward}
          isTxPending={isTxPending}
          cooldownDuration={cooldownDuration}
          onClose={() => setOpen(false)}
          onSave={reward => {
            onSave?.(reward)
            setOpen(false)
          }}
          onRewardChange={onRewardChange}
          {...args}
        />
      )}
    </div>
  )
}

export default {
  title: 'MyRewards/UpdateBackerRewardModal',
  component: UpdateBackerRewardModal,
  argTypes: {
    currentReward: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Current reward percentage',
    },
    initialUpdatedReward: {
      control: { type: 'text' },
      description: 'Initial value for the updated reward input',
    },
    suggestedReward: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Suggested reward percentage',
    },
    isTxPending: {
      control: { type: 'boolean' },
      description: 'Whether the save operation is pending',
    },
    onClose: { action: 'closed' },
    onSave: { action: 'saved' },
    onRewardChange: { action: 'reward changed' },
  },
  args: {
    currentReward: 20,
    updatedReward: 20,
    suggestedReward: 22,
    isTxPending: false,
    cooldownDuration: Duration.fromObject({ days: 6, hours: 24, minutes: 59 }),
  },
}

export const Default = (args: any) => <StoryWrapper {...args} />

export const Pending = (args: any) => <StoryWrapper {...args} isTxPending={true} />

export const WithLongCooldown = (args: any) => (
  <StoryWrapper {...args} cooldownDuration={Duration.fromObject({ days: 10, hours: 12, minutes: 30 })} />
)

export const WithShortCooldown = (args: any) => (
  <StoryWrapper {...args} cooldownDuration={Duration.fromObject({ hours: 2, minutes: 15 })} />
)
