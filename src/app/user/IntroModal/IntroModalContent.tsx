'use client'

import { AccentSquare } from '@/components/AccentSquare'
import { Button } from '@/components/Button'
import { ArrowRightIcon, ArrowUpRightLightIcon, CloseIconKoto } from '@/components/Icons'
import { Modal } from '@/components/Modal'
import { MoltenBackground } from '@/components/MoltenBackground'
import { BANNER_CTA_CLASSES, BANNER_EYEBROW_CLASSES } from '@/components/PageBanner'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC, RIF } from '@/lib/constants'
import { cn, formatNumberWithCommas } from '@/lib/utils'

import { CONTENT_CONFIG, type IntroModalContentProps, type IntroModalStatus } from './config'

const PIXEL_FILLS = ['', '', 'bg-v3-rif-blue', '', 'bg-v3-primary', '', 'bg-molten-ink', '', '']

interface Props {
  tokenStatus: IntroModalStatus
  onClose: () => void
  onContinue: (url: string, external: boolean) => void
  rbtcBalance?: string
  rifBalance?: string
}

export const IntroModalContent = ({ tokenStatus, rbtcBalance, rifBalance, onClose, onContinue }: Props) => {
  const content = CONTENT_CONFIG[tokenStatus]

  const handleContinue = () => onContinue(content.action.url, content.action.external)

  return (
    <Modal
      width={1100}
      onClose={onClose}
      hideCloseButton
      className="bg-surface-warm overflow-y-auto md:rounded-3xl"
      data-testid="intro-modal"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="z-base absolute right-4 top-4 md:right-7.5 md:top-[42px]"
        data-testid="CloseButton"
      >
        <CloseIconKoto size={24} aria-hidden color="black" />
      </button>

      <div className="flex flex-col gap-7 p-5 pt-14 md:flex-row md:pt-5">
        <ArtworkPanel content={content} rbtcBalance={rbtcBalance} rifBalance={rifBalance} />

        <div className="flex flex-1 flex-col md:pt-6" data-testid="stake-description">
          <div className="flex items-center gap-3">
            <AccentSquare className="size-[7px] bg-v3-rif-blue" />
            <Span
              caps
              bold
              variant="body-s"
              className={cn(BANNER_EYEBROW_CLASSES, 'text-v3-text-0')}
              data-testid="stake-label"
            >
              Stake
            </Span>
          </div>
          <Header variant="e2" caps className="mt-8 md:mt-10 md:text-[2.5rem]" data-testid="stake-heading">
            <span className="block text-v3-bg-accent-40" data-testid="stake-title">
              {content.title}
            </span>
            <span className="block text-v3-text-0" data-testid="stake-subtitle">
              {content.subtitle}
            </span>
          </Header>
          <div className="mt-6 max-w-[430px] border-t border-v3-text-0/15 pt-4">
            <Paragraph variant="body-l" className="text-v3-bg-accent-60" data-testid="StakeDescription">
              {content.description}
            </Paragraph>
          </div>
          <div className="mt-10 flex justify-center">
            <Button
              variant="primary"
              className={cn('flex items-center gap-4 md:px-11 md:py-[18px]', BANNER_CTA_CLASSES)}
              onClick={handleContinue}
              data-testid="intro-modal-continue-button"
            >
              <Span bold className="md:text-xl md:leading-7">
                {content.action.external ? 'Continue' : 'Continue to staking'}
              </Span>
              {content.action.external && (
                <ArrowUpRightLightIcon aria-hidden size={24} color="currentColor" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

interface ArtworkPanelProps {
  content: IntroModalContentProps
  rbtcBalance?: string
  rifBalance?: string
}

/**
 * The square on the left: molten artwork, the pixel mark tucked into the top right
 * corner, and the wallet card floating in the middle.
 */
const ArtworkPanel = ({ content, rbtcBalance, rifBalance }: ArtworkPanelProps) => (
  <div className="bg-molten-ink relative aspect-square w-full shrink-0 overflow-hidden rounded-[18px] md:flex-1 md:self-start">
    <MoltenBackground />

    <div
      aria-hidden="true"
      className="absolute right-3.5 top-3.5 grid grid-cols-3 grid-rows-3 gap-[3px]"
      data-testid="wallet-pixels"
    >
      {PIXEL_FILLS.map((fill, index) => (
        <span key={index} className={cn('size-[9px]', fill)} />
      ))}
    </div>
    <div className="z-base absolute inset-0 flex items-center justify-center p-[9%]">
      <WalletCard content={content} rbtcBalance={rbtcBalance} rifBalance={rifBalance} />
    </div>
  </div>
)

const WalletCard = ({ content, rbtcBalance, rifBalance }: ArtworkPanelProps) => (
  <div
    className="border-molten-peach/30 flex w-full max-w-[430px] flex-col gap-4 rounded-2xl border bg-[rgba(15,11,9,0.76)] px-7 pb-7 pt-6"
    data-testid="wallet-info"
  >
    <Span
      caps
      bold
      variant="body-s"
      className={cn('text-molten-peach', BANNER_EYEBROW_CLASSES)}
      data-testid="wallet-info-title"
    >
      Your wallet
    </Span>

    <div className="flex flex-col gap-3.5">
      {content.showRbtc && <TokenPair from="BTC" to={RBTC} symbol={RBTC} data-testid="wallet-info-rbtc" />}
      {content.showRif && <TokenPair from="USD" to={RIF} symbol={RIF} data-testid="wallet-info-rif" />}

      {content.showBalance && rbtcBalance && rifBalance && (
        <>
          <TokenBalance
            amount={formatNumberWithCommas(Big(rbtcBalance).toFixedNoTrailing(6))}
            symbol={RBTC}
          />
          <TokenBalance amount={formatNumberWithCommas(Big(rifBalance).toFixedNoTrailing(2))} symbol={RIF} />
        </>
      )}
    </div>
    {content.walletInfo && (
      <>
        <div aria-hidden="true" className="flex items-center">
          <span className="bg-v3-rif-blue h-0.5 w-[46px]" />
          <span className="bg-banner-title/15 h-px flex-1" />
        </div>

        {/* Paragraph prefixes its testid, so this resolves to `ParagraphWalletInfo`. */}
        <Paragraph variant="body-s" className="text-banner-body" data-testid="WalletInfo">
          {content.walletInfo}
        </Paragraph>
      </>
    )}
  </div>
)

interface TokenPairProps {
  /** What the holder is converting from, kept quiet so the token they need reads first. */
  from: string
  to: string
  symbol: string
  'data-testid'?: string
}

const TokenPair = ({ from, to, symbol, 'data-testid': dataTestId }: TokenPairProps) => (
  <div className="flex items-baseline gap-2 md:gap-3.5" data-testid={dataTestId}>
    <Span variant="h3" caps className="text-banner-body w-[38px] shrink-0 leading-none md:w-10 md:text-2xl">
      {from}
    </Span>
    <ArrowRightIcon aria-hidden size={24} color="var(--color-v3-primary)" className="shrink-0 self-center" />
    <Span variant="h1" caps className="text-banner-title leading-none md:text-[2.5rem]">
      {to}
    </Span>
    <TokenImage decorative symbol={symbol} size={34} className="ml-0.5 shrink-0 self-center" />
  </div>
)

const TokenBalance = ({ amount, symbol }: { amount: string; symbol: string }) => (
  <div className="flex items-baseline gap-3">
    <Span variant="h2" caps className="text-banner-title min-w-0 break-words leading-none">
      {amount} {symbol}
    </Span>
    <TokenImage decorative symbol={symbol} size={24} className="shrink-0 self-center" />
  </div>
)
