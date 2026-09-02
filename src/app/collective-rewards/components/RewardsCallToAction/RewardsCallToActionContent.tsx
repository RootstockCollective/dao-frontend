'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { Link } from '@/components/Link'
import { Header, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { cn } from '@/lib/utils'

import { formatUsdWhole } from '../../utils/dashboardFormatters'

const CR_WHITEPAPER_URL = 'https://rootstockcollective.xyz/pdfs/rewards-whitepaper.pdf'

/** The two gradients that head the cards, kept distinct so the roles read apart at a glance. */
const GRADIENTS = {
  backers:
    'linear-gradient(90deg, var(--brand-rif-blue) 0%, #7C89F5 30%, var(--brand-rootstock-pink) 70%, transparent 100%)',
  builders:
    'linear-gradient(90deg, var(--color-v3-text-100) 0%, var(--color-v3-primary) 45%, var(--brand-rootstock-green) 80%, transparent 100%)',
} as const

interface CallToActionCardProps {
  gradient: string
  title: string
  summary: ReactNode
  action: ReactNode
  secondaryAction: ReactNode
  'data-testid'?: string
}

const CallToActionCard = ({
  gradient,
  title,
  summary,
  action,
  secondaryAction,
  'data-testid': dataTestId,
}: CallToActionCardProps) => (
  <div
    className="relative overflow-hidden rounded-lg bg-v3-bg-accent-80 flex flex-col gap-4 p-5 md:p-6"
    data-testid={dataTestId}
  >
    <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: gradient }} />

    <Header variant="h2" caps className="text-v3-text-100">
      {title}
    </Header>

    <Paragraph className="text-v3-text-40">{summary}</Paragraph>

    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
      {action}
      {secondaryAction}
    </div>
  </div>
)

const SecondaryLink = ({ href, children }: { href: string; children: string }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="no-underline hover:underline text-v3-text-40"
  >
    {children}
  </Link>
)

export interface RewardsCallToActionContentProps {
  /** Rewards heading to Backers in the running cycle. */
  backersUpcoming: Big
  /** Rewards heading to Builders in the running cycle. */
  buildersUpcoming: Big
  backersCount?: number | null
  buildersCount?: number | null
  className?: string
}

export const RewardsCallToActionContent = ({
  backersUpcoming,
  buildersUpcoming,
  backersCount = null,
  buildersCount = null,
  className,
}: RewardsCallToActionContentProps) => {
  const router = useRouter()

  const summaryFor = (amount: Big, count: number | null, role: string) =>
    count === null
      ? `${formatUsdWhole(amount)} upcoming for ${role}s this cycle.`
      : `${formatUsdWhole(amount)} upcoming for ${count} ${role}s this cycle.`

  return (
    <div className={cn('grid grid-cols-1 gap-2', className)} data-testid="rewards-call-to-action">
      <CallToActionCard
        gradient={GRADIENTS.backers}
        title="Back Builders, be rewarded"
        summary={summaryFor(backersUpcoming, backersCount, 'Backer')}
        action={
          <Button variant="primary" onClick={() => router.push('/backing')}>
            Stake RIF
          </Button>
        }
        secondaryAction={<SecondaryLink href={CR_WHITEPAPER_URL}>Backers&apos; terms</SecondaryLink>}
        data-testid="cta-backers"
      />

      <CallToActionCard
        gradient={GRADIENTS.builders}
        title="Be rewarded for building"
        summary={summaryFor(buildersUpcoming, buildersCount, 'Builder')}
        action={
          <Button variant="primary" onClick={() => router.push('/proposals/new?type=Builder')}>
            Join Builder Rewards
          </Button>
        }
        secondaryAction={
          <button
            type="button"
            onClick={() => router.push('/proposals/new?type=Grants')}
            className="text-v3-text-40 hover:underline cursor-pointer"
          >
            <Paragraph className="cursor-[inherit] text-v3-text-40">Apply for a Grant</Paragraph>
          </button>
        }
        data-testid="cta-builders"
      />
    </div>
  )
}
