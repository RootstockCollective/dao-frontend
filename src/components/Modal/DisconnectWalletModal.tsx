import { Header, Paragraph, Span } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { FC } from 'react'

interface Props {
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}

export const DisconnectWalletModal: FC<Props> = ({ onClose, onConfirm, onCancel }) => (
  <Modal onClose={onClose} width={756}>
    <div className="px-[50px] pt-[42px] pb-[84px] flex justify-center flex-col items-center">
      <Header variant="h2">DISCONNECT WALLET</Header>
      <Paragraph className="mt-3 text-center">
        Are you sure you want to disconnect your wallet? <br />
        You&#39;ll need to reconnect to access your account and <br />
        manage your assets.
      </Paragraph>
      <div className="w-full flex justify-center mt-[26px] gap-6">
        <Button variant="secondary-outline" onClick={onCancel} data-testid="Cancel">
          Cancel
        </Button>
        <Button onClick={onConfirm} data-testid="DisconnectModal">
          <Span className="text-text-100" bold>
            Disconnect
          </Span>
        </Button>
      </div>
    </div>
  </Modal>
)
