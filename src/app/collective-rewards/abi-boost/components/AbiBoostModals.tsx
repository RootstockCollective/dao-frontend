import { ReactNode } from 'react'
import { Address } from 'viem'

import { useBuilderContext } from '@/app/collective-rewards/user'
import { formatSymbol } from '@/app/shared/formatter'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { RIF, STRIF } from '@/lib/constants'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { formatAbiBoostAmount } from '../abiBoost.utils'
import { useGoToBackBuilders } from '../hooks/useAbiBoost'
import { BoostedRate, CurrentAbiRate } from './AbiBoostRates'
import { AbiBoostRow, BoostPill } from './AbiBoostTags'
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
      {children && <div className="mt-6 flex flex-col border-t border-bg-40">{children}</div>}
      <div className="mt-8">
        <Divider />
        <div className="mt-4 flex flex-wrap justify-end gap-3">{actions}</div>
      </div>
    </div>
  </Modal>
)

interface BoostEligibleModalProps {
  /** RIF just staked, as typed in the stake flow. */
  stakedAmount: string
  onClose: () => void
}

/** Shown once a stake leaves the wallet holding enough stRIF for the boost. */
export const BoostEligibleModal = ({ stakedAmount, onClose }: BoostEligibleModalProps) => {
  const goToBackBuilders = useGoToBackBuilders()
  return (
    <AbiBoostModalShell
      data-testid="BoostEligibleModal"
      eyebrow="Boost eligible"
      title="You're eligible for the boost"
      description={
        <>
          {formatAbiBoostAmount(stakedAmount, RIF)} is now {STRIF}. Back Builders with {minBacking} or more
          and the {boostDelta} boost switches on for {term}. Keep it backing to keep the rate.
        </>
      }
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary-outline" onClick={onClose} data-testid="BoostEligibleDone">
            Done
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose()
              goToBackBuilders()
            }}
            data-testid="BoostEligibleBackBuilder"
          >
            Back a Builder
          </Button>
        </>
      }
    />
  )
}

interface BoostActivatedModalProps {
  /** On-chain backing per Builder right after the save, in wei. */
  allocations: Record<Address, bigint>
  onClose: () => void
}

const BoostActivatedModalContent = ({ allocations, onClose }: BoostActivatedModalProps) => {
  const { getBuilderByAddress } = useBuilderContext()
  const backed = Object.entries(allocations).filter(([, amount]) => amount > 0n) as [Address, bigint][]
  const total = backed.reduce((sum, [, amount]) => sum + amount, 0n)
  const builders = backed.length === 1 ? '1 Builder' : `${backed.length} Builders`

  return (
    <AbiBoostModalShell
      data-testid="BoostActivatedModal"
      eyebrow="Boost active"
      title={`Congrats, this backing has a ${boost} boost`}
      description={
        <>
          {formatSymbol(total, STRIF)} {STRIF} is now split across {builders}. The boost runs for {term}, for
          as long as your backing stays at {minBacking} or more.
        </>
      }
      onClose={onClose}
      actions={
        <Button variant="primary" onClick={onClose} data-testid="BoostActivatedDone">
          Done
        </Button>
      }
    >
      {backed.map(([address, amount]) => (
        <AbiBoostRow key={address} label={getBuilderByAddress(address)?.builderName || address}>
          {formatSymbol(amount, STRIF)} {STRIF}
        </AbiBoostRow>
      ))}
      <AbiBoostRow label="Annual Backers Incentives">
        <CurrentAbiRate />
      </AbiBoostRow>
      <AbiBoostRow label="Boost">{boostDelta}</AbiBoostRow>
      <AbiBoostRow label="Rate on this backing">
        <BoostedRate className="text-v3-primary" />
      </AbiBoostRow>
    </AbiBoostModalShell>
  )
}

/** Shown when saving a backing takes it over the minimum and switches the boost on. */
export const BoostActivatedModal = withAbiBoostFlag(BoostActivatedModalContent)
