import { Paragraph, Typography } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { FC } from 'react'
import { FaUser } from 'react-icons/fa'
import { shortAddress } from '@/lib/utils'
import { Address } from 'viem'

interface Props {
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  address?: Address
}
export const DisconnectWalletModal: FC<Props> = ({ onClose, onConfirm, onCancel, address }) => (
  <Modal onClose={onClose} width={756}>
    <div className="px-[50px] pt-[42px] pb-[84px] flex justify-center flex-col items-center">
      <Paragraph className="text-[24px]" fontFamily="kk-topo">
        DISCONNECT WALLET
      </Paragraph>
      <Paragraph variant="normal" className="text-[16px] text-center">
        Are you sure you want to disconnect your wallet? <br />
        You won&apos;t be able to interact with the dApp.
      </Paragraph>
      <div className="my-[32px] p-[15px] bg-input-bg flex gap-2 items-center justify-between min-w-[377px] rounded-[6px]">
        <FaUser /> {/* @TODO insert provider image */}
        <Typography tagVariant="span" className="flex-1">
          {shortAddress(address, 8)}
        </Typography>
        <Typography tagVariant="span">RSK Network</Typography>
      </div>
      <div className="w-full flex justify-center mt-2 gap-6">
        <Button onClick={onConfirm}>Disconnect</Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
)
