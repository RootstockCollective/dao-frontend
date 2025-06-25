/* eslint-disable quotes */
import { Button } from '@/components/ButtonNew'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { ArrowRightIcon } from '@/components/Icons/ArrowRightIcon'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const GLASS_STYLE =
  'rounded bg-[rgba(255,255,255,0.16)] shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.25)] backdrop-blur-[3px]'

const RBTC_RIF_BG_DESKTOP_SVG = '/images/intro/rbtc-rif-bg-desktop.svg'
const RBTC_RIF_BG_MOBILE_SVG = '/images/intro/rbtc-rif-bg-mobile.svg'
const RBTC_RIF_SQUARES_DESKTOP_SVG = '/images/intro/rbtc-rif-squares-desktop.svg'
const RBTC_RIF_SQUARES_MOBILE_SVG = '/images/intro/rbtc-rif-squares-mobile.svg'

const RBTC_BG_DESKTOP_SVG = '/images/intro/rbtc-bg-desktop.svg'
const RBTC_BG_MOBILE_SVG = '/images/intro/rbtc-bg-mobile.svg'
const RBTC_SQUARES_DESKTOP_SVG = '/images/intro/rbtc-squares-desktop.svg'
const RBTC_SQUARES_MOBILE_SVG = '/images/intro/rbtc-squares-mobile.svg'

const IMAGE_PATHS = [
  RBTC_RIF_BG_DESKTOP_SVG,
  RBTC_RIF_BG_MOBILE_SVG,
  RBTC_RIF_SQUARES_DESKTOP_SVG,
  RBTC_RIF_SQUARES_MOBILE_SVG,
]

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => {
      setMatches(media.matches)
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

export const IntroModal = () => {
  const introModal = useModal()
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    let loadedCount = 0
    const handleLoad = () => {
      if (++loadedCount === IMAGE_PATHS.length) {
        setIsLoaded(true)
      }
    }

    IMAGE_PATHS.forEach(path => {
      const image = new window.Image()
      image.src = path
      image.onload = handleLoad
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      introModal.openModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  const status = 2
  return (
    introModal.isModalOpened &&
    isLoaded && (
      <Modal width={920} onClose={introModal.closeModal} closeButtonColor="black" className="bg-text-80">
        <div className="flex flex-col md:flex-row p-4 md:gap-6 relative">
          {status === 1 && (
            <>
              {isMobile ? (
                <div className="mt-12 flex flex-col gap-4">
                  <div className="relative">
                    <Image
                      src={RBTC_RIF_BG_MOBILE_SVG}
                      alt="Intro Modal"
                      height={0}
                      width={0}
                      className="h-auto w-full"
                    />
                    <Image
                      src={RBTC_RIF_SQUARES_MOBILE_SVG}
                      alt="Squares Divider"
                      width={40}
                      height={30}
                      className="absolute bottom-[-40px] right-0"
                    />
                  </div>
                  <StakeDescription status={status} />
                  <ContinueButton className="mt-12" />
                </div>
              ) : (
                <>
                  <Image
                    src={RBTC_RIF_SQUARES_DESKTOP_SVG}
                    alt="Squares Divider"
                    width={40}
                    height={30}
                    className="absolute block left-1/2 top-8 -translate-x-[calc(55%)] z-10"
                  />
                  <div className="flex-1 relative">
                    <div className="relative">
                      <Image
                        src={RBTC_RIF_BG_DESKTOP_SVG}
                        alt="Intro Modal"
                        height={0}
                        width={0}
                        className="h-auto w-full"
                      />
                      <YourWalletInfo status={status} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-4 md:p-0">
                    <StakeDescription status={status} />
                    <div className="flex justify-end">
                      <ContinueButton />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {status === 2 &&
            (isMobile ? (
              <div className="mt-12 flex flex-col gap-4">
                <div className="relative">
                  <Image
                    src={RBTC_BG_MOBILE_SVG}
                    alt="Intro Modal"
                    height={0}
                    width={0}
                    className="h-auto w-full"
                  />
                  <Image
                    src={RBTC_SQUARES_MOBILE_SVG}
                    alt="Squares Divider"
                    width={40}
                    height={30}
                    className="absolute bottom-[-40px] right-0"
                  />
                </div>
                <StakeDescription status={status} />
                <ContinueButton className="mt-12" />
              </div>
            ) : (
              <>
                <Image
                  src={RBTC_SQUARES_DESKTOP_SVG}
                  alt="Squares Divider"
                  width={40}
                  height={30}
                  className="absolute block left-1/2 top-8 -translate-x-[calc(55%)] z-10"
                />
                <div className="flex-1 relative">
                  <div className="relative">
                    <Image
                      src={RBTC_BG_DESKTOP_SVG}
                      alt="Intro Modal"
                      height={0}
                      width={0}
                      className="h-auto w-full"
                    />
                    <YourWalletInfo status={status} />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between p-4 md:p-0">
                  <StakeDescription status={status} />
                  <div className="flex justify-end">
                    <ContinueButton />
                  </div>
                </div>
              </>
            ))}
        </div>
      </Modal>
    )
  )
}

const StakeDescription = ({ status }: { status: number }) => (
  <div className="flex flex-1 flex-col justify-center gap-4">
    <Label variant="tag" className="text-bg-100" caps>
      STAKE
    </Label>
    <div>
      <Header variant="e2" className="text-bg-20" caps>
        Before you stake
      </Header>
      <Header variant="e2" className="text-bg-100" caps>
        {status === 1 ? 'add RBTC & RIF to your wallet' : 'add RBTC to your wallet'}
      </Header>
    </div>
    <Paragraph className="text-bg-100">
      {status === 1
        ? "RIF is the token required for staking, and RBTC is used to cover transaction fees. You'll need both to participate in the DAO."
        : "RBTC is used to cover transaction fees. You'll need both RBTC and RIF to participate in the DAO."}
    </Paragraph>
  </div>
)

const YourWalletInfo = ({ status }: { status: number }) => (
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
    {status === 1 && (
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
      {status === 1 ? 'You need RBTC to pay fees & RIF to stake' : 'You need RBTC for the transaction fees'}
    </Paragraph>
  </div>
)

const ContinueButton = ({ className }: { className?: string }) => (
  <Button variant="secondary" className={cn('flex items-center gap-1', className)}>
    <Span bold>Continue</Span>
    <ArrowUpRightLightIcon size={24} />
  </Button>
)
