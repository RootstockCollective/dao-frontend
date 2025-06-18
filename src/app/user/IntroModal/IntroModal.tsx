import { Button } from '@/components/ButtonNew'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Modal } from '@/components/Modal'
import { Label, Header, Paragraph, Span } from '@/components/TypographyNew'
import { useModal } from '@/shared/hooks/useModal'
import Image from 'next/image'
import { useEffect } from 'react'

export const IntroModal = () => {
  const introModal = useModal()
  useEffect(() => {
    const image = new window.Image()
    image.src = '/images/intro/rbtc-rif-bg.svg'
    image.onload = () => {
      introModal.openModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    introModal.isModalOpened && (
      <Modal width={920} onClose={introModal.closeModal} closeButtonColor="black">
        <div className="flex flex-row p-4 bg-text-80 gap-6">
          <div className="flex-1">
            <Image
              src="/images/intro/rbtc-rif-bg.svg"
              alt="Intro Modal"
              height={0}
              width={0}
              className="h-auto w-full"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-1 flex-col justify-center">
              <Label variant="tag" className="text-bg-100" caps>
                STAKE
              </Label>
              <Header variant="e2" className="text-bg-20" caps>
                Before you stake
              </Header>
              <Header variant="e2" className="text-bg-100" caps>
                add RBTC & RIF to your wallet
              </Header>
              <Paragraph className="text-bg-100 mt-4">
                RIF is the token required for staking, and RBTC is used to cover transaction fees. You&apos;ll
                need both to participate in the DAO.
              </Paragraph>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" className="flex items-center gap-1">
                <Span bold>Continue</Span>
                <ArrowUpRightLightIcon size={24} />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  )
}
