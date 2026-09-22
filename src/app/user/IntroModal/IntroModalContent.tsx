'use client'

import { AccentSquare } from '@/components/AccentSquare'
import { Button } from '@/components/Button'
import { ArrowRightIcon, ArrowUpRightLightIcon } from '@/components/Icons'
import { Modal } from '@/components/Modal'
import { MoltenBackground } from '@/components/MoltenBackground'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC, RIF } from '@/lib/constants'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { CONTENT_CONFIG, type IntroModalContentProps, type IntroModalStatus } from './config'

const PIXEL_FILLS = ['', '', 'bg-v3-rif-blue', '', 'bg-v3-primary', '', 'bg-molten-ink', '', '']

const CTA_CLASSES = 'border-banner-ink shadow-[0_3px_0_var(--color-banner-ink)]'

interface Props {
  tokenStatus: IntroModalStatus
  onClose: () => void
  onContinue: (url: string, external: boolean) => void
  rbtcBalance?: string
  rifBalance?: string
}

export const IntroModalContent = ({ tokenStatus, rbtcBalance, rifBalance, onClose, onContinue }: Props) => {
  const content = CONTENT_CONFIG[tokenStatus]
  const isDesktop = useIsDesktop()

  const handleContinue = () => onContinue(content.action.url, content.action.external)

  return (
    <Modal
      width={920}
      onClose={onClose}
      closeButtonColor="black"
      className="bg-surface-warm overflow-y-auto"
      data-testid={isDesktop ? 'intro-modal-desktop' : 'intro-modal-mobile'}
    >
      <div className="flex flex-col gap-7 p-5 md:flex-row">
        <ArtworkPanel content={content} rbtcBalance={rbtcBalance} rifBalance={rifBalance} />

        <div className="flex flex-1 flex-col md:pt-4" data-testid="stake-description">
          <div className="flex items-center gap-3">
            <AccentSquare className="size-[7px] bg-v3-rif-blue" />
            <Span
              caps
              bold
              variant="body-s"
              className="text-[12px] tracking-[0.18em] text-v3-text-0"
              data-testid="stake-label"
            >
              Stake
            </Span>
          </div>

          <Header variant="e2" caps className="mt-8 text-v3-bg-accent-20" data-testid="stake-title">
            {content.title}
          </Header>
          <Header variant="e2" caps className="text-v3-text-0" data-testid="stake-subtitle">
            {content.subtitle}
          </Header>

          {/* Hairline separating the headline from the copy it introduces. */}
          <div className="mt-6 max-w-[430px] border-t border-v3-text-0/15 pt-4">
            <Paragraph variant="body-l" className="text-v3-bg-accent-60" data-testid="stake-description-text">
              {content.description}
            </Paragraph>
          </div>

          <div className="mt-10 flex justify-end md:mt-auto md:pt-10">
            <Button
              variant="primary"
              className={cn('flex items-center gap-2', CTA_CLASSES)}
              onClick={handleContinue}
              data-testid="intro-modal-continue-button"
            >
              <Span bold>{content.action.external ? 'Continue' : 'Continue to staking'}</Span>
              {content.action.external && <ArrowUpRightLightIcon size={24} color="currentColor" />}
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
  <div className="bg-molten-ink relative aspect-square w-full shrink-0 overflow-hidden rounded md:max-w-[520px] md:flex-1">
    <MoltenBackground />

    <div
      aria-hidden="true"
      className="absolute right-3.5 top-3.5 z-base grid grid-cols-3 grid-rows-3 gap-[3px]"
      data-testid="wallet-pixels"
    >
      {PIXEL_FILLS.map((fill, index) => (
        <span key={index} className={cn('size-[9px]', fill)} />
      ))}
    </div>

    <div className="absolute inset-0 flex items-center justify-center p-[9%]">
      <WalletCard content={content} rbtcBalance={rbtcBalance} rifBalance={rifBalance} />
    </div>
  </div>
)

const WalletCard = ({ content, rbtcBalance, rifBalance }: ArtworkPanelProps) => (
  <div
    className="border-molten-peach/30 flex w-full max-w-[372px] flex-col gap-[18px] border bg-[rgba(15,11,9,0.76)] px-7 pb-7 pt-6"
    data-testid="wallet-info"
  >
    <Span
      caps
      bold
      variant="body-s"
      className="text-molten-peach text-[12px] tracking-[0.16em]"
      data-testid="wallet-info-title"
    >
      Your wallet
    </Span>

    <div className="flex flex-col gap-3.5">
      {content.showRbtc && <TokenPair from="BTC" to={RBTC} symbol={RBTC} data-testid="wallet-info-rbtc" />}
      {content.showRif && <TokenPair from="USD" to="RIF" symbol={RIF} data-testid="wallet-info-rif" />}

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

    {/* A short blue rule running out into a hairline, under the figures. */}
    <div aria-hidden="true" className="flex items-center">
      <span className="bg-v3-rif-blue h-0.5 w-[46px]" />
      <span className="bg-banner-title/15 h-px flex-1" />
    </div>

    {content.walletInfo && (
      <Paragraph variant="body-s" className="text-banner-body" data-testid="wallet-info-description">
        {content.walletInfo}
      </Paragraph>
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
  <div className="flex items-baseline gap-3" data-testid={dataTestId}>
    <Span variant="h3" caps className="text-molten-stone w-[46px] shrink-0 leading-none">
      {from}
    </Span>
    <ArrowRightIcon size={20} color="var(--color-v3-primary)" className="shrink-0 self-center" />
    <Span variant="h1" caps className="text-banner-title leading-none">
      {to}
    </Span>
    <TokenImage symbol={symbol} size={30} className="shrink-0 self-center" />
  </div>
)

/**
 * A held balance rather than a pair. It steps down a size from {@link TokenPair}: the
 * figures run long, and the card is only so wide.
 */
const TokenBalance = ({ amount, symbol }: { amount: string; symbol: string }) => (
  <div className="flex items-baseline gap-3">
    <Span variant="h2" caps className="text-banner-title min-w-0 break-words leading-none">
      {amount} {symbol}
    </Span>
    <TokenImage symbol={symbol} size={24} className="shrink-0 self-center" />
  </div>
)
