import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import type { ConnectButtonComponentProps } from '@/shared/walletConnection/types'

import { CONNECT_CTA_CLASSES } from './styles'

const SIZES = {
  /** 48px, in the banner. */
  banner: { className: 'h-12 px-[26px]', textClassName: undefined, testId: 'ConnectButton' },
  /** 40px, in the docked bar. */
  dock: { className: 'h-10 px-5', textClassName: 'text-[15px]', testId: 'DockConnectButton' },
} as const

type ConnectCtaButtonProps = ConnectButtonComponentProps & { size: keyof typeof SIZES }

/** The orange Connect wallet call to action shared by the banner and its docked bar. */
export const ConnectCtaButton = ({ onClick, size }: ConnectCtaButtonProps) => {
  const { className, textClassName, testId } = SIZES[size]
  return (
    <Button
      onClick={onClick}
      className={cn(CONNECT_CTA_CLASSES, className)}
      textClassName={textClassName}
      data-testid={testId}
    >
      Connect wallet
    </Button>
  )
}

export const BannerConnectButton = (props: ConnectButtonComponentProps) => (
  <ConnectCtaButton {...props} size="banner" />
)

export const DockConnectButton = (props: ConnectButtonComponentProps) => (
  <ConnectCtaButton {...props} size="dock" />
)
