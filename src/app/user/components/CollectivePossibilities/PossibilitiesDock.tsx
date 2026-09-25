'use client'

import { DismissButton } from '@/components/DismissButton'
import { cn } from '@/lib/utils'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

import { PosterArt } from './PosterArt'
import { CONNECT_CTA_CLASSES, EYEBROW_CLASSES } from './styles'

const EASE = 'ease-[cubic-bezier(0.22,0.61,0.36,1)]'

interface PossibilitiesDockProps {
  isDocked: boolean
  /** False on the first paint, so a page that loads scrolled shows the bar without sliding it in. */
  shouldAnimate: boolean
  onDismiss: () => void
}

/**
 * Compact version of the Don't Miss banner that docks under the top bar once the banner has
 * scrolled away, so the connect prompt stays in reach.
 *
 * Its height opens through grid rows (0fr to 1fr) rather than `height: auto`, and it is inert
 * while closed so its controls never catch focus. Under prefers-reduced-motion it appears and
 * disappears at the same points without any transition.
 */
export const PossibilitiesDock = ({ isDocked, shouldAnimate, onDismiss }: PossibilitiesDockProps) => (
  <div
    className={cn(
      '@container grid',
      isDocked ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      shouldAnimate && `transition-[grid-template-rows] duration-320 ${EASE} motion-reduce:transition-none`,
    )}
    inert={!isDocked}
    data-docked={isDocked}
    data-testid="PossibilitiesDock"
  >
    <div className="min-h-0 overflow-hidden">
      <div
        role="region"
        aria-label="Connect wallet prompt"
        className={cn(
          'mb-3 flex h-16 items-center gap-4 rounded-[12px] border border-btc-orange/35 bg-warm-surface-raised pl-2.5 pr-3',
          isDocked ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
          shouldAnimate &&
            `transition-[opacity,translate] duration-[280ms,320ms] ${EASE} motion-reduce:transition-none`,
        )}
      >
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[8px] bg-banner-ink">
          <PosterArt moleculeSize={24} imageClassName="object-[70%_50%]" />
        </div>

        <div className="flex min-w-0 flex-1 items-baseline gap-3.5 overflow-hidden whitespace-nowrap">
          {/* On narrow screens the eyebrow goes first so the title has room before it truncates */}
          <span className={cn(EYEBROW_CLASSES, 'hidden flex-none text-[12px] @min-[900px]:inline')}>
            Don&apos;t miss
          </span>
          <span className="min-w-0 truncate font-kk-topo text-[20px] leading-none text-v3-text-80">
            THE COLLECTIVE <span className="text-warm-text-dim">POSSIBILITIES</span>
          </span>
        </div>

        <ConnectWorkflow
          ConnectComponent={props => (
            <button
              type="button"
              {...props}
              className={cn(CONNECT_CTA_CLASSES, 'h-10 px-5 text-[15px]')}
              data-testid="DockConnectButton"
            >
              Connect wallet
            </button>
          )}
        />
        <DismissButton
          variant="roundQuiet"
          aria-label="Dismiss"
          onClick={onDismiss}
          data-testid="DismissDockButton"
        />
      </div>
    </div>
  </div>
)
