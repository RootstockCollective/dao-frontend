import type { Meta, StoryObj } from '@storybook/react'
import UpdateBackerRewardViewModal from './UpdateBackerRewardViewModal'
import { Button } from '@/components/ButtonNew'
import { useState } from 'react'
import { Duration } from 'luxon'

const meta: Meta<typeof UpdateBackerRewardViewModal> = {
  title: 'MyRewards/UpdateBackerRewardViewModal',
  component: UpdateBackerRewardViewModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof UpdateBackerRewardViewModal>

// Base configuration for all stories
const baseArgs = {
  onClose: () => {},
  currentReward: 15,
  updatedReward: 20,
  onRewardChange: () => {},
  onSave: () => {},
  cooldownDuration: Duration.fromObject({ days: 7 }),
  suggestedReward: 18,
  isOperational: true,
}

// Common render function for interactive stories
const InteractiveStory = ({ props, buttonText }: { props: any; buttonText: string }) => {
  const [isModalOpened, setIsModalOpened] = useState(false)
  const [updatedReward, setUpdatedReward] = useState(props.updatedReward)

  return (
    <>
      <Button onClick={() => setIsModalOpened(true)}>{buttonText}</Button>
      {isModalOpened && (
        <UpdateBackerRewardViewModal
          {...props}
          updatedReward={updatedReward}
          onClose={() => setIsModalOpened(false)}
          onRewardChange={(value: string) => setUpdatedReward(Number(value))}
          onSave={() => {
            setIsModalOpened(false)
          }}
        />
      )}
    </>
  )
}

export const Default: Story = {
  args: baseArgs,
  render: (props: any) => <InteractiveStory props={props} buttonText="Open Update Backer Reward Modal" />,
}

export const WithCooldownPeriod: Story = {
  args: {
    ...baseArgs,
    currentReward: 10,
    updatedReward: 25,
    cooldownDuration: Duration.fromObject({ days: 14, hours: 6 }),
    suggestedReward: 22,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open with 14-day Cooldown" />,
}

export const NotOperational: Story = {
  args: {
    ...baseArgs,
    currentReward: 12,
    updatedReward: 18,
    suggestedReward: 15,
    isOperational: false,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open (Not Operational)" />,
}

export const AlreadySubmitted: Story = {
  args: {
    ...baseArgs,
    currentReward: 8,
    updatedReward: 8,
    alreadySubmitted: true,
    suggestedReward: 10,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open (Already Submitted)" />,
}

export const TransactionPending: Story = {
  args: {
    ...baseArgs,
    currentReward: 20,
    updatedReward: 25,
    suggestedReward: 23,
    isTxPending: true,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open (Transaction Pending)" />,
}

export const Loading: Story = {
  args: {
    ...baseArgs,
    isLoading: true,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open (Loading)" />,
}

export const NoSuggestedReward: Story = {
  args: {
    ...baseArgs,
    currentReward: 5,
    updatedReward: 8,
    suggestedReward: undefined,
  },
  render: (props: any) => <InteractiveStory props={props} buttonText="Open (No Suggested Reward)" />,
}
