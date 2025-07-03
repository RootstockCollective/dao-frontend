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

export const DelegateWithName: Story = {
  args: {
    onClose: () => {},
    title: 'You are about to delegate your own voting power of 1,000,000 to',
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

export const DelegateWithAddressOnly: Story = {
  args: {
    onClose: () => {},
    title: 'You are about to delegate your own voting power of 1,000,000 to',
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

export const ReclaimWithName: Story = {
  args: {
    onClose: () => {},
    title: 'You are about to reclaim your own voting power of 1,000,000 from',
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

export const ReclaimWithAddressOnly: Story = {
  args: {
    onClose: () => {},
    title: 'You are about to reclaim your own voting power of 1,000,000 from',
    address: '0xc6cc5b597f80276eae5cb80530acff3e89070a47',
    since: 'your delegate since December 31, 2024',
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
