import { Button } from '@/components/Button'
import { ConnectButton } from '@/components/Header'
import { Modal } from '@/components/Modal/Modal'
import { Paragraph } from '@/components/Typography'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export const ConnectWalletModal = () => {
  const router = useRouter()
  const onCancel = () => router.push('/')
  return (
    <Modal onClose={onCancel} width={756}>
      <div className="px-[42px] py-[50px] flex justify-center flex-col items-center">
        <Image src="/images/connect-wallet-icon.svg" width={120} height={120} alt="Lock" />
        <Paragraph className="text-[24px] mt-4">Sign in to view more</Paragraph>
        <Paragraph variant="light" className="text-[16px] text-center">
          This section is accessible to holders/builders. <br />
          Connect your wallet to have access.
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
