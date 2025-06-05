// Modal.stories.tsx
import { Modal } from '@/components/Modal/Modal'
import { useModal } from '@/shared/hooks/useModal'
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modals/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    width: {
      control: { type: 'number' },
    },
    height: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
  },
}

export default meta

type Story = StoryObj<typeof Modal>

// Wrapper component to manage modal state
const ModalWrapper = (args: any) => {
  const { isModalOpened, openModal, closeModal } = useModal()

  useEffect(() => {
    openModal()
  }, [openModal])

  if (!isModalOpened) return null

  return (
    <Modal {...args} onClose={closeModal}>
      {args.children || (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4 font-kk-topo">Modal Content</h2>
          <p>This is a sample modal content.</p>
        </div>
      )}
    </Modal>
  )
}

export const Default: Story = {
  render: args => <ModalWrapper {...args} />,
}

export const CustomWidth: Story = {
  render: args => <ModalWrapper {...args} width={400} />,
  args: {
    width: 400,
  },
}

export const CustomHeight: Story = {
  render: args => <ModalWrapper {...args} height={300} />,
  args: {
    height: 300,
  },
}

export const CustomContent: Story = {
  render: args => (
    <ModalWrapper {...args}>
      <div className="p-6 bg-[var(--color-bg-80)]">
        <h2 className="text-2xl font-bold mb-4">Custom Modal</h2>
        <p>This modal has custom content and styling.</p>
        <div className="mt-4 flex justify-between">
          <button className="bg-primary text-100 px-4 py-2 rounded">Confirm</button>
          <button className="bg-warm-gray text-0 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </ModalWrapper>
  ),
}

export const ResponsiveTest: Story = {
  render: args => <ModalWrapper {...args} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const DesktopTest: Story = {
  render: args => <ModalWrapper {...args} />,
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}
