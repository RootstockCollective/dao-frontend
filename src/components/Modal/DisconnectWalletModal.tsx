import { Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { FC } from 'react'

interface Props {
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}

export const DisconnectWalletModal: FC<Props> = ({ onClose, onConfirm, onCancel }) => (
  <Modal onClose={onClose} className="w-[756px]">
    <div className="px-[50px] pt-[42px] pb-[84px] flex justify-center flex-col items-center">
      <Paragraph className="text-[24px] mb-[8px]" fontFamily="kk-topo">
        DISCONNECT WALLET
      </Paragraph>
      <Paragraph variant="normal" className="text-[16px] text-center">
        Are you sure you want to disconnect your wallet? <br />
        You&#39;ll need to reconnect to access your account and <br />
        manage your assets.
      </Paragraph>
      <div className="w-full flex justify-center mt-[26px] gap-6">
        <Button variant="outlined" onClick={onCancel} data-testid="Cancel">
          Cancel
        </Button>
        <Button onClick={onConfirm} data-testid="DisconnectModal">
          Disconnect
        </Button>
      </div>
    </div>
  </Modal>
)
