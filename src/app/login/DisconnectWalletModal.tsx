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
  <Modal onClose={onClose} width={756}>
    <div className='px-[50px] pt-[42px] pb-[84px] flex justify-center flex-col items-center'>
      <Paragraph className='text-[24px]'>Disconnect wallet</Paragraph>
      <Paragraph
        variant='light'
        className='text-[16px] text-center'
      >
        Are you sure you want to disconnect your wallet? <br />
        You won&apos;t be able to interact with the dApp.
      </Paragraph>
      <div className='mt-[32px]'>

      </div>
      <div className='w-full flex justify-evenly mt-2'>
        <Button onClick={onConfirm}>Disconnect</Button>
        <Button variant='white' onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  </Modal>
)
