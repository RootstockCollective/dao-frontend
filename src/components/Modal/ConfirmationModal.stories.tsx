import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmationModal } from '.'
import { Button } from '../Button'
import { useModal } from '@/shared/hooks/useModal'

const meta = {
  component: ConfirmationModal,
  title: 'Components/Modals/ConfirmationModal',
} satisfies Meta<typeof ConfirmationModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Disclaimer',
    isOpen: false,
    onClose: () => {},
  },
  render: props => {
    const { isModalOpened, openModal, closeModal } = useModal()
    return (
      <>
        <Button onClick={openModal}>Open</Button>
        <ConfirmationModal
          {...props}
          isOpen={isModalOpened}
          onClose={closeModal}
          onAccept={closeModal}
          onDecline={closeModal}
        >
          The RootstockCollective has taken actions in order to prevent access to any person located in the
          prohibited jurisdictions, as mentioned in the Terms of Use, including any person located in the
          United States of America. Please note that interaction with the dApp by any person or entity
          considered a resident, or taxpayer in a prohibited jurisdiction, including without limitation the
          United States of America, is forbidden. Please read the terms and conditions carefully before using
          the RootstockCollective dApp.
        </ConfirmationModal>
      </>
    )
  },
}

export const Builder: Story = {
  args: {
    title: 'Builder Disclaimer',
    isOpen: false,
    onClose: () => {},
  },
  render: props => {
    const { isModalOpened, openModal, closeModal } = useModal()
    return (
      <>
        <Button onClick={openModal}>Open</Button>
        <ConfirmationModal
          {...props}
          isOpen={isModalOpened}
          onClose={closeModal}
          onAccept={closeModal}
          onDecline={closeModal}
        >
          By submitting your request to become a whitelisted Builder in the Collective Rewards, you hereby
          acknowledge and agree to be bound to the terms of the Collective Rewards and to submit your KYC
          information to the RootstockCollective Foundation. You accept that the information submitted will be
          treated pursuant to the Privacy Policy.
        </ConfirmationModal>
      </>
    )
  },
}

export const Footer: Story = {
  args: {
    title: 'Custom buttons',
    isOpen: false,
    onClose: () => {},
  },
  render: props => {
    const { isModalOpened, openModal, closeModal } = useModal()
    return (
      <>
        <Button onClick={openModal}>Open</Button>
        <ConfirmationModal
          {...props}
          isOpen={isModalOpened}
          onClose={closeModal}
          onAccept={closeModal}
          onDecline={closeModal}
          buttons={
            <>
              <Button onClick={closeModal}>Cancel</Button>
            </>
          }
        >
          When the &quot;buttons&quot; prop is passed, it replaces the default Agree/Disagree buttons
        </ConfirmationModal>
      </>
    )
  },
}
