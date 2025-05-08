import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { showToast, updateToast } from './toastUtils'
import { TX_MESSAGES } from '@/shared/txMessages'

export default {
  title: 'Shared/ToastUtils',
  parameters: {
    layout: 'centered',
  },
} as Meta

const buttonProps = {
  style: {
    border: '2px solid #ccc',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

const Template: StoryFn = () => {
  return (
    <div className="flex flex-col gap-4">
      <button
        {...buttonProps}
        onClick={() =>
          showToast({
            title: 'Success Toast',
            content: 'Everything went well!',
            severity: 'success',
            dismissible: true,
          })
        }
      >
        Trigger Success Toast
      </button>

      <button
        {...buttonProps}
        onClick={() =>
          showToast({
            title: 'Error Toast',
            content: 'Something went wrong!',
            severity: 'error',
            dismissible: false,
            closeButton: true,
          })
        }
      >
        Trigger Error Toast (Non-dismissible)
      </button>

      <button
        {...buttonProps}
        onClick={() =>
          showToast({
            title: 'Info Toast',
            content: 'Here is some information.',
            severity: 'info',
            loading: true,
          })
        }
      >
        Trigger Loading Info Toast
      </button>

      <button
        {...buttonProps}
        onClick={() =>
          showToast({
            title: 'Warning Toast',
            content: 'This is a warning message!',
            severity: 'warning',
            dismissible: true,
            loading: false,
          })
        }
      >
        Trigger Warning Toast
      </button>

      <button
        {...buttonProps}
        onClick={() => {
          const toastId = showToast(TX_MESSAGES.staking.pending)
          setTimeout(() => {
            updateToast(toastId, TX_MESSAGES.staking.success)
          }, 3000)
        }}
      >
        Trigger Pending to Success Staking Toast
      </button>

      <button
        {...buttonProps}
        onClick={() => {
          const toastId = showToast(TX_MESSAGES.staking.pending)
          setTimeout(() => {
            updateToast(toastId, TX_MESSAGES.staking.error)
          }, 3000)
        }}
      >
        Trigger Pending to Error Staking Toast
      </button>
    </div>
  )
}

export const ToastScenarios = Template.bind({})
