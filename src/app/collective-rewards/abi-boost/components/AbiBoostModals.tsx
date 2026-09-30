import { ArrowRight } from 'lucide-react'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { useBuilderContext } from '@/app/collective-rewards/user'
import { formatSymbol } from '@/app/shared/formatter'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { Modal } from '@/components/Modal'
import { Header, Paragraph, Span } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { formatAbiBoostAmount } from '../abiBoost.utils'
import { useGoToBackBuilders } from '../hooks/useAbiBoost'
import { useBackingBoostChange } from '../hooks/useBackingBoostChange'
import { BoostedRate } from './AbiBoostRates'
import { AbiBoostRow, BoostPill } from './AbiBoostTags'
import { BOOSTED_RATE_INFO, HowTheBoostWorksLink } from './HowTheBoostWorks'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const { boost, boostDelta, minBacking, term } = ABI_BOOST_LABELS

interface ShellProps {
  eyebrow: string
  title: string
  description: ReactNode
  actions: ReactNode
  onClose: () => void
  'data-testid': string
  children?: ReactNode
}

const AbiBoostModalShell = ({
  eyebrow,
  title,
  description,
  children,
  actions,
  onClose,
  'data-testid': dataTestId,
}: ShellProps) => (
  <Modal onClose={onClose} data-testid={dataTestId}>
    <div className="flex h-full flex-col p-4 md:p-6">
      <BoostPill className="mt-12 uppercase tracking-[0.12em]">{eyebrow}</BoostPill>
      <Header variant="h1" caps className="mt-4">
        {title}
      </Header>
      <Paragraph variant="body" className="mt-3 text-text-60">
        {description}
      </Paragraph>
      {children && <div className="mt-6">{children}</div>}
      <div className="mt-8">
        <Divider />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <HowTheBoostWorksLink />
          <div className="flex gap-3">{actions}</div>
        </div>
      </div>
    </div>
  </Modal>
)

interface NextStepProps {
  title: string
  description: string
  href: string
  onClick: () => void
}

const NextStep = ({ title, description, href, onClick }: NextStepProps) => (
  <NextLink
    href={href}
    onClick={onClick}
    className="group flex w-full items-center justify-between gap-4 border-b border-bg-40 py-4 text-left no-underline"
  >
    <span className="flex flex-col gap-1">
      <Span variant="body" className="group-hover:text-v3-primary">
        {title}
      </Span>
      <Span variant="body-s" className="text-text-60">
        {description}
      </Span>
    </span>
    <ArrowRight size={16} aria-hidden="true" className="shrink-0 group-hover:text-v3-primary" />
  </NextLink>
)

interface BoostEligibleModalProps {
  stakedAmount: string
  onClose: () => void
}

export const BoostEligibleModal = ({ stakedAmount, onClose }: BoostEligibleModalProps) => {
  const goToBackBuilders = useGoToBackBuilders()
  const closeAnd = (navigate: () => void) => () => {
    onClose()
    navigate()
  }

  return (
    <AbiBoostModalShell
      data-testid="BoostEligibleModal"
      eyebrow="Boost eligible"
      title="You're eligible for the boost"
      description={
        <>
          {formatAbiBoostAmount(stakedAmount, RIF)} is now {STRIF}. Back Builders with {minBacking} or more
          and the {boostDelta} boost switches on for {term}. It&apos;s tied to this deposit, so keep it
          backing to keep the rate.
        </>
      }
      onClose={onClose}
      actions={
        <Button variant="secondary-outline" onClick={onClose} data-testid="BoostEligibleDone">
          Done
        </Button>
      }
    >
      <Button
        variant="primary"
        className="w-fit"
        onClick={closeAnd(goToBackBuilders)}
        data-testid="BoostEligibleBackBuilder"
      >
        <span className="flex items-center gap-2">
          Back a Builder <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Button>
      <Span variant="body-s" className="mt-8 block border-b border-bg-40 pb-3 text-text-60">
        Also worth doing
      </Span>
      <NextStep
        title="Join a community"
        description="Community badges raise your rank and keep you visible in the Collective."
        href="/communities"
        onClick={onClose}
      />
      <NextStep
        title="Track your rewards"
        description="Follow each cycle and claim what your backing has earned."
        href="/my-rewards"
        onClick={onClose}
      />
    </AbiBoostModalShell>
  )
}

interface BoostActivatedModalProps {
  allocations: Record<Address, bigint>
  onClose: () => void
}

const BoostActivatedModalContent = ({ allocations, onClose }: BoostActivatedModalProps) => {
  const { getBuilderByAddress } = useBuilderContext()
  const { current: total } = useBackingBoostChange()
  const backed = Object.entries(allocations).filter(([, amount]) => amount > 0n) as [Address, bigint][]
  const builders = backed.length === 1 ? '1 Builder' : `${backed.length} Builders`

  return (
    <AbiBoostModalShell
      data-testid="BoostActivatedModal"
      eyebrow="Boost active"
      title={`Congrats, this backing has a ${boost} boost`}
      description={
        <>
          {formatSymbol(total, STRIF)} {STRIF} is now split across {builders}. The boost runs for {term} on
          this deposit, for as long as it keeps backing Builders.
        </>
      }
      onClose={onClose}
      actions={
        <Button variant="primary" onClick={onClose} data-testid="BoostActivatedDone">
          Done
        </Button>
      }
    >
      <div className="flex flex-col border-t border-bg-40">
        {backed.map(([address, amount]) => (
          <AbiBoostRow key={address} label={getBuilderByAddress(address)?.builderName || address}>
            {formatSymbol(amount, STRIF)} {STRIF}
          </AbiBoostRow>
        ))}
        <AbiBoostRow
          label="Rate on this backing"
          info={<InfoIconButton info={BOOSTED_RATE_INFO} tooltipClassName="max-w-xs" />}
        >
          <BoostedRate className="text-v3-primary" />
        </AbiBoostRow>
      </div>
    </AbiBoostModalShell>
  )
}

export const BoostActivatedModal = withAbiBoostFlag(BoostActivatedModalContent)
