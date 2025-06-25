import { Button } from '@/components/ButtonNew'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CONTENT_CONFIG, IMAGE_CONFIG, type IntroModalContent } from './config'
import { useIntroModalStatus } from './hooks/useIntroModalStatus'
import { useMediaQuery } from './hooks/useMediaQuery'

const GLASS_STYLE =
  'rounded bg-[rgba(255,255,255,0.16)] shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.25)] backdrop-blur-[3px]'

export const IntroModal = () => {
  const introModal = useModal()
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const modalStatus = useIntroModalStatus()

  // Preload all images
  useEffect(() => {
    const allImagePaths = Object.values(IMAGE_CONFIG).flatMap(config => [
      config.desktop.bg,
      config.desktop.squares,
      config.mobile.bg,
      config.mobile.squares,
    ])

    let loadedCount = 0
    const handleLoad = () => {
      if (++loadedCount === allImagePaths.length) {
        setIsLoaded(true)
      }
    }

    allImagePaths.forEach(path => {
      const image = new window.Image()
      image.src = path
      image.onload = handleLoad
    })
  }, [])

  useEffect(() => {
    if (isLoaded && modalStatus !== null) {
      introModal.openModal()
    } else if (modalStatus === null) {
      introModal.closeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, modalStatus])

  const handleContinue = (): void => {
    if (modalStatus) {
      const currentContent = CONTENT_CONFIG[modalStatus]
      window.open(currentContent.url, '_blank', 'noopener,noreferrer')
      introModal.closeModal()
    }
  }

  // Don't render if no modal status or not loaded
  if (!modalStatus || !isLoaded || !introModal.isModalOpened) {
    return null
  }

  const currentConfig = IMAGE_CONFIG[modalStatus]
  const currentContent = CONTENT_CONFIG[modalStatus]

  return (
    <Modal width={920} onClose={introModal.closeModal} closeButtonColor="black" className="bg-text-80">
      <div className="flex flex-col md:flex-row p-4 md:gap-6 relative">
        {isMobile ? (
          <div className="mt-12 flex flex-col gap-4">
            <div className="relative">
              <Image
                src={currentConfig.mobile.bg}
                alt="Intro Modal"
                height={0}
                width={0}
                className="h-auto w-full"
              />
              <Image
                src={currentConfig.mobile.squares}
                alt="Squares Divider"
                width={40}
                height={30}
                className="absolute bottom-[-40px] right-0"
              />
            </div>
            <StakeDescription content={currentContent} />
            <ContinueButton className="mt-12" onClick={handleContinue} />
          </div>
        ) : (
          <>
            <Image
              src={currentConfig.desktop.squares}
              alt="Squares Divider"
              width={40}
              height={30}
              className="absolute block left-1/2 top-8 -translate-x-[calc(55%)] z-10"
            />
            <div className="flex-1 relative">
              <div className="relative">
                <Image
                  src={currentConfig.desktop.bg}
                  alt="Intro Modal"
                  height={0}
                  width={0}
                  className="h-auto w-full"
                />
                <YourWalletInfo content={currentContent} />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between p-4 md:p-0">
              <StakeDescription content={currentContent} />
              <div className="flex justify-end">
                <ContinueButton onClick={handleContinue} />
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

const StakeDescription = ({ content }: { content: IntroModalContent }) => (
  <div className="flex flex-1 flex-col justify-center gap-4">
    <Label variant="tag" className="text-bg-100" caps>
      STAKE
    </Label>
    <div>
      <Header variant="e2" className="text-bg-20" caps>
        Before you stake
      </Header>
      <Header variant="e2" className="text-bg-100" caps>
        {content.title}
      </Header>
    </div>
    <Paragraph className="text-bg-100">{content.description}</Paragraph>
  </div>
)

const YourWalletInfo = ({ content }: { content: IntroModalContent }) => (
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

    {content.showRbtc && (
      <Header variant="e2" className="text-text-100 flex flex-row items-end gap-2" caps>
        <Span className="flex flex-row items-center gap-2">
          BTC
          <ArrowRightIcon size={16} />
        </Span>
        <Span variant="e2" className="text-text-100">
          RBTC
        </Span>
      </Header>
    )}
    {content.showRif && (
      <Header variant="e2" className="text-text-100 flex flex-row items-end gap-2" caps>
        <Span className="flex flex-row items-center gap-2">
          USD
          <ArrowRightIcon size={16} />
        </Span>
        <Span variant="e2" className="text-text-100">
          RIF
        </Span>
      </Header>
    )}
    <Paragraph variant="body-s" className="text-text-100 mt-2">
      {content.walletInfo}
    </Paragraph>
  </div>
)

const ContinueButton = ({ className, onClick }: { className?: string; onClick: () => void }) => (
  <Button variant="secondary" className={cn('flex items-center gap-1', className)} onClick={onClick}>
    <Span bold>Continue</Span>
    <ArrowUpRightLightIcon size={24} />
  </Button>
)
