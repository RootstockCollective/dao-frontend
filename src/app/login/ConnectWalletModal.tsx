import { Button } from '@/components/Button'
import { ConnectButton } from '@/components/Header'
import { Modal } from '@/components/Modal/Modal'
import { Paragraph } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { PiFileLock } from 'react-icons/pi'

export const ConnectWalletModal = () => {
  const router = useRouter()
  const onCancel = () => router.push('/')
  return (
    <Modal onClose={onCancel} width={756}>
      <div className="px-[42px] py-[50px] flex justify-center flex-col items-center">
        <div
          style={{
            boxShadow: '0px 0px 16.4px 0px rgba(123,87,252,0.68)',
            padding: 17,
            borderRadius: '30%',
            backgroundColor: 'white',
          }}
        >
          <PiFileLock size={48} color="#665EF6" />
        </div>
        <Paragraph className="text-[24px] mt-8">Sign in to view more</Paragraph>
        <Paragraph variant="light" className="text-[16px] text-center">
          This section is accessible to holders/builders/ <br />
          connect your wallet to have access.
        </Paragraph>

        <div className="w-full flex justify-center mt-8 gap-6">
          <ConnectButton />
          <Button variant="white" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}