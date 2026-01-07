import { type ComponentProps } from 'react'
import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon, HammerIcon } from '../icons'
import { ProposalCategory } from '@/shared/types'
import { cn } from '@/lib/utils'
import { MilestoneIcon } from '../MilestoneIcon'
import { Milestones } from '../../shared/types'
import { Span } from '@/components/Typography'

interface Props extends ComponentProps<'div'> {
  category: ProposalCategory
  hasGradient?: boolean
  showText?: boolean
}

export function Category({ category, hasGradient = false, className, showText = false, ...props }: Props) {
  const icons = {
    [ProposalCategory.Grants]: <GrantsIcon hasGradient={hasGradient} data-testid="ProposalType_Grants" />,
    [ProposalCategory.Activation]: (
      <HammerIcon hasGradient={hasGradient} data-testid="ProposalType_Activation" />
    ),
    [ProposalCategory.Deactivation]: (
      <HammerIcon hasGradient={hasGradient} data-testid="ProposalType_Deactivation" />
    ),
    [ProposalCategory.Milestone1]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_1}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone1"
      />
    ),
    [ProposalCategory.Milestone2]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_2}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone2"
      />
    ),
    [ProposalCategory.Milestone3]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_3}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone3"
      />
    ),
  } as const satisfies Record<ProposalCategory, React.JSX.Element>

  return (
    <Tooltip text={category}>
      <div className={cn('cursor-default flex items-center gap-2', className)} {...props}>
        {icons[category]}
        {showText && (
          <Span variant="body-s" className="text-bg-0">
            {category}
          </Span>
        )}
      </div>
    </Tooltip>
  )
}
