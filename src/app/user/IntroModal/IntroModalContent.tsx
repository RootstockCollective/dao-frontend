import { Button } from '@/components/ButtonNew'
import { ArrowRightIcon, ArrowUpRightLightIcon } from '@/components/Icons'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import Image from 'next/image'
import { CONTENT_CONFIG, IMAGE_CONFIG, type IntroModalContentProps, type IntroModalStatus } from './config'

const GLASS_STYLE =
  'rounded bg-[rgba(255,255,255,0.16)] shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.25)] backdrop-blur-[3px]'

interface Props {
  tokenStatus: IntroModalStatus
  isDesktop: boolean
  rbtcBalance?: string
  rifBalance?: string
  onClose: () => void
  onContinue: (url: string, external: boolean) => void
}

export const IntroModalContent = ({
  tokenStatus,
  isDesktop,
  rbtcBalance,
  rifBalance,
  onClose,
  onContinue,
}: Props) => {
  const currentConfig = IMAGE_CONFIG[tokenStatus]
  const currentContent = CONTENT_CONFIG[tokenStatus]
  const action = currentContent.action

  const handleContinue = () => onContinue(action.url, action.external)

  return (
    <Modal
      width={920}
      onClose={onClose}
      closeButtonColor="black"
      className="bg-text-80"
      data-testid={isDesktop ? 'intro-modal-desktop' : 'intro-modal-mobile'}
    >
      <div className="flex flex-col md:flex-row p-4 md:gap-6 relative justify-center">
        {isDesktop ? (
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
                <YourWalletInfo content={currentContent} rbtcBalance={rbtcBalance} rifBalance={rifBalance} />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between p-4 md:p-0">
              <StakeDescription content={currentContent} />
              <div className="flex justify-end">
                {currentContent.action.external ? (
                  <ContinueButton className="mt-12" onClick={handleContinue} />
                ) : (
                  <ContinueToStakingButton className="mt-12" onClick={handleContinue} />
                )}
              </div>
            </div>
          </>
        ) : (
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
                width={30}
                height={20}
                className="absolute bottom-[-30px] right-0"
              />
            </div>
            <StakeDescription content={currentContent} />
            {currentContent.action.external ? (
              <ContinueButton className="mt-12" onClick={handleContinue} />
            ) : (
              <ContinueToStakingButton className="mt-12" onClick={handleContinue} />
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

const StakeDescription = ({ content }: { content: IntroModalContentProps }) => (
  <div className="flex flex-1 flex-col justify-center gap-4" data-testid="stake-description">
    <Label variant="tag" className="text-bg-100" caps data-testid="stake-label">
      STAKE
    </Label>
    <div>
      <Header variant="e2" className="text-bg-20" caps data-testid="stake-subtitle">
        {content.title}
      </Header>
      <Header variant="e2" className="text-bg-100" caps data-testid="stake-title">
        {content.subtitle}
      </Header>
    </div>
    <Paragraph className="text-bg-100" data-testid="stake-description-text">
      {content.description}
    </Paragraph>
  </div>
)

interface YourWalletInfoProps {
  content: IntroModalContentProps
  rbtcBalance?: string
  rifBalance?: string
}

const YourWalletInfo = ({ content, rbtcBalance, rifBalance }: YourWalletInfoProps) => {
  return (
    <div
      className={cn(
        'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'p-4 w-[360px]',
        GLASS_STYLE,
      )}
      data-testid="wallet-info"
    >
      <Header variant="e3" className="text-text-100 mb-8" caps data-testid="wallet-info-title">
        Your Wallet
      </Header>

      {content.showRbtc && (
        <Header
          variant="e2"
          className="text-text-100 flex flex-row items-end gap-2"
          caps
          data-testid="wallet-info-rbtc"
        >
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
        <Header
          variant="e2"
          className="text-text-100 flex flex-row items-end gap-2"
          caps
          data-testid="wallet-info-rif"
        >
          <Span className="flex flex-row items-center gap-2">
            USD
            <ArrowRightIcon size={16} />
          </Span>
          <Span variant="e2" className="text-text-100">
            RIF
          </Span>
        </Header>
      )}
      {content.showBalance && rbtcBalance && rifBalance && (
        <div className="text-text-100 flex flex-col items-start gap-2">
          <Header variant="e2" className="text-text-100">
            {formatNumberWithCommas(Big(rbtcBalance).toFixedNoTrailing(6))} RBTC
          </Header>
          <Header variant="e2" className="text-text-100">
            {formatNumberWithCommas(Big(rifBalance).toFixedNoTrailing(2))} RIF
          </Header>
        </div>
      )}
      <Paragraph variant="body-s" className="text-text-100 mt-2" data-testid="wallet-info-description">
        {content.walletInfo}
      </Paragraph>
    </div>
  )
}

const ContinueButton = ({ className, onClick }: { className?: string; onClick: () => void }) => (
  <Button
    variant="secondary"
    className={cn('flex items-center gap-1', className)}
    onClick={onClick}
    data-testid="intro-modal-continue-button"
  >
    <Span bold>Continue</Span>
    <ArrowUpRightLightIcon size={24} />
  </Button>
)

const ContinueToStakingButton = ({ className, onClick }: { className?: string; onClick: () => void }) => (
  <Button variant="primary" className={cn('flex items-center gap-1', className)} onClick={onClick}>
    <Span bold>Continue to staking</Span>
  </Button>
)
