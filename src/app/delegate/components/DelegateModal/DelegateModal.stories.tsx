import type { Meta, StoryObj } from '@storybook/react'
import { DelegateModal } from './DelegateModal'
import { Button } from '@/components/ButtonNew'
import { useState } from 'react'

const meta: Meta<typeof DelegateModal> = {
  title: 'Delegate/DelegateModal',
  component: DelegateModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof DelegateModal>

export const WithName: Story = {
  args: {
    onClose: () => {},
    amount: 1000000,
    address: '0xc6cc5b597f80276eae5cb80530acff3e89070a47',
    name: 'Boltz',
    since: 'May 2025',
  },
  render: props => {
    const [isModalOpened, setIsModalOpened] = useState(false)
    return (
      <>
        <Button onClick={() => setIsModalOpened(true)}>Open</Button>
        {isModalOpened && (
          <DelegateModal
            {...props}
            onClose={() => setIsModalOpened(false)}
            onDelegate={() => {
              console.log('Delegating...')
              setIsModalOpened(false)
            }}
          />
        )}
      </>
    )
  },
}

export const WithAddressOnly: Story = {
  args: {
    onClose: () => {},
    amount: 1000000,
    address: '0xc6cc5b597f80276eae5cb80530acff3e89070a47',
  },
  render: props => {
    const [isModalOpened, setIsModalOpened] = useState(false)
    return (
      <>
        <Button onClick={() => setIsModalOpened(true)}>Open</Button>
        {isModalOpened && (
          <DelegateModal
            {...props}
            onClose={() => setIsModalOpened(false)}
            onDelegate={() => {
              console.log('Delegating...')
              setIsModalOpened(false)
            }}
          />
        )}
      </>
    )
  },
}
