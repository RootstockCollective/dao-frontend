import { Button } from '@/components/ButtonNew'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'
import Image from 'next/image'
import { useEffect } from 'react'

const GLASS_STYLE =
  'rounded bg-[rgba(255,255,255,0.16)] shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.25)] backdrop-blur-[3px]'

const IMAGE_PATHS = ['/images/intro/rbtc-rif-bg.svg', '/images/intro/rbtc-rif-squares-desktop.svg']

export const IntroModal = () => {
  const introModal = useModal()
  useEffect(() => {
    let loadedCount = 0
    const handleLoad = () => {
      if (++loadedCount === IMAGE_PATHS.length) {
        introModal.openModal()
      }
    }

    IMAGE_PATHS.forEach(path => {
      const image = new window.Image()
      image.src = path
      image.onload = handleLoad
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    introModal.isModalOpened && (
      <Modal width={920} onClose={introModal.closeModal} closeButtonColor="black">
        <div className="flex flex-row p-4 bg-text-80 gap-6 relative">
          <Image
            src="/images/intro/rbtc-rif-squares-desktop.svg"
            alt="Squares Divider"
            width={40}
            height={30}
            className="absolute left-1/2 top-8 -translate-x-1/2 z-10"
            style={{ pointerEvents: 'none' }}
          />
          <div className="flex-1">
            <div className="relative">
              <Image
                src="/images/intro/rbtc-rif-bg.svg"
                alt="Intro Modal"
                height={0}
                width={0}
                className="h-auto w-full"
              />
              <div
                className={cn(
                  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                  'p-4 w-[360px]',
                  GLASS_STYLE,
                )}
              >
                <Header variant="e3" className="text-text-100 mb-8" caps>
                  Your Wallet
                </Header>
                <Header variant="e2" className="text-text-100 flex flex-row items-end gap-2" caps>
                  <Span className="flex flex-row items-center gap-2">
                    BTC
                    <ArrowRightIcon size={16} />
                  </Span>
                  <Span variant="e2" className="text-text-100">
                    RBTC
                  </Span>
                </Header>
                <Header variant="e2" className="text-text-100 flex flex-row items-end gap-2" caps>
                  <Span className="flex flex-row items-center gap-2">
                    USD
                    <ArrowRightIcon size={16} />
                  </Span>
                  <Span variant="e2" className="text-text-100">
                    RIF
                  </Span>
                </Header>
                <Paragraph variant="body-s" className="text-text-100 mt-2">
                  You need RBTC to pay fees & RIF to stake
                </Paragraph>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-1 flex-col justify-center gap-4">
              <Label variant="tag" className="text-bg-100" caps>
                STAKE
              </Label>
              <div>
                <Header variant="e2" className="text-bg-20" caps>
                  Before you stake
                </Header>
                <Header variant="e2" className="text-bg-100" caps>
                  add RBTC & RIF to your wallet
                </Header>
              </div>
              <Paragraph className="text-bg-100">
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
