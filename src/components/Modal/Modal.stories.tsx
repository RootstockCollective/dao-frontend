// Modal.stories.tsx
import { Modal } from '@/components/Modal/Modal'
import { useModal } from '@/shared/hooks/useModal'
import type { Meta, StoryObj } from '@storybook/nextjs'
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

/**
 * Opt-in dialog semantics. With `trapFocus`, Tab and Shift+Tab wrap inside the panel, focus
 * returns to whatever opened it on unmount, and the panel is announced as a labelled dialog.
 * Left off, the 18 pre-existing call sites keep exactly the behaviour they had.
 */
export const FocusTrapped: Story = {
  render: args => (
    <ModalWrapper {...args} trapFocus ariaLabel="Accessible dialog" width={480}>
      <div className="p-6 flex flex-col gap-3 items-start">
        <h2 className="text-xl font-bold font-kk-topo">Tab is trapped in here</h2>
        <p>Tab past the last control and focus wraps back to the close button.</p>
        <button className="bg-primary text-bg-100 px-4 py-2 rounded">First</button>
        <button className="bg-primary text-bg-100 px-4 py-2 rounded">Last</button>
      </div>
    </ModalWrapper>
  ),
}

/** Escape is opt-in too, so a modal mid-transaction cannot be dismissed out from under it. */
export const DismissibleWithEscape: Story = {
  render: args => {
    const Wrapper = () => {
      const { isModalOpened, openModal, closeModal } = useModal()
      useEffect(() => openModal(), [openModal])

      return isModalOpened ? (
        <Modal {...args} width={480} onClose={closeModal} onEscape={closeModal} trapFocus ariaLabel="Press escape">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 font-kk-topo">Press Escape</h2>
            <p>Without an `onEscape` handler the key does nothing.</p>
          </div>
        </Modal>
      ) : (
        <button className="m-8 underline" onClick={openModal}>
          Reopen
        </button>
      )
    }

    return <Wrapper />
  },
}

/**
 * A fixed pixel height is capped at 95dvh, so a short viewport shrinks the panel instead of
 * clipping its footer past the edge of a container that does not scroll.
 */
export const FixedHeightOnAShortViewport: Story = {
  render: args => (
    <ModalWrapper {...args} height={700} width={600}>
      <div className="flex h-full flex-col justify-between p-6">
        <h2 className="text-xl font-bold font-kk-topo">700px tall</h2>
        <button className="bg-primary text-bg-100 px-4 py-2 rounded self-start">
          Still reachable at any height
        </button>
      </div>
    </ModalWrapper>
  ),
  parameters: { viewport: { defaultViewport: 'mobile2' } },
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
