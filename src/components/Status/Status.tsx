import { Paragraph } from '../Typography'
import { cn } from '@/lib/utils'
import { FC, JSX } from 'react'
import { ProposalState } from '@/shared/types'

type Props = JSX.IntrinsicElements['div'] & {
  proposalState?: ProposalState
}

const VARIANTS = {
  [ProposalState.Active]: {
    label: 'Active',
    classes: 'bg-brand-rootstock-lime text-text-0',
  },
  [ProposalState.Executed]: {
    label: 'Executed',
    classes: 'bg-bg-40',
  },
  [ProposalState.Defeated]: {
    label: 'Defeated',
    classes: 'bg-error text-text-0',
  },
  [ProposalState.Succeeded]: {
    label: 'Success',
    classes: 'bg-success text-text-0',
  },
  [ProposalState.Canceled]: {
    label: 'Cancelled',
    classes: 'bg-bg-40',
  },
  [ProposalState.Expired]: {
    label: 'Expired',
    classes: 'bg-bg-40',
  },
  [ProposalState.Queued]: {
    label: 'On queue',
    classes: 'bg-brand-rootstock-purple text-text-0',
  },
  [ProposalState.Pending]: {
    label: 'Pending',
    classes: 'bg-bg-40',
  },
  [ProposalState.None]: {
    label: 'Unknown',
    classes: 'bg-bg-40 text-text-100',
  },
} satisfies Record<ProposalState, { label: string; classes: string }>

/**
 *  This logic returns the variant based on the proposal state
 *  Proposal State can be 0, be careful.
 * @param proposalState
 */
const getVariants = (proposalState?: ProposalState): (typeof VARIANTS)[keyof typeof VARIANTS] => {
  if (proposalState !== undefined && proposalState in VARIANTS) return VARIANTS[proposalState]

  return VARIANTS[ProposalState.None]
}

export const Status: FC<Props> = ({ proposalState, className, ...rest }) => {
  const { label, classes } = getVariants(proposalState)

  return (
    <div
      className={cn(
        'px-1 py-[3px] w-full max-w-[68px] h-[26px]',
        'inline-flex items-center justify-center',
        'rounded-full text-text-100 overflow-hidden',
        classes,
      )}
      {...rest}
    >
      <Paragraph className="whitespace-nowrap text-[clamp(10px,1.1vw,12px)]">{label}</Paragraph>
    </div>
  )
}
