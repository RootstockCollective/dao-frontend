import { Button } from '@/components/Button'
import { ConnectButton } from '@/components/Header'
import { Modal } from '@/components/Modal/Modal'
import { Paragraph } from '@/components/Typography'
import { useRouter } from 'next/navigation'

export const ConnectWalletModal = () => {
  const router = useRouter()
  const onCancel = () => router.push('/')
  return (
    <Modal onClose={onCancel} className="w-[756px]" data-testid="ConnectWalletModal">
      <div className="px-[42px] py-[50px] flex justify-center flex-col items-center">
        <Paragraph className="text-[24px] mt-4" fontFamily="kk-topo">
          SIGN IN TO VIEW MORE
        </Paragraph>
        <Paragraph variant="normal" className="text-[16px] text-center">
          This page is only accessible to logged in users. <br />
          Connect your wallet to view more.
        </Paragraph>

        <div className="w-full flex justify-center mt-8 gap-6">
          <ConnectButton />
          <Button variant="white" onClick={onCancel} data-testid="Cancel">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
