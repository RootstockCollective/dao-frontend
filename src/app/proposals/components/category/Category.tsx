import { type ComponentProps } from 'react'

import { type IconProps } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ProposalCategory } from '@/shared/types'

import { Milestones } from '../../shared/types'
import { GrantsIcon, HammerIcon } from '../icons'
import { MilestoneIcon } from '../MilestoneIcon'

interface Props extends ComponentProps<'div'> {
  category: ProposalCategory
  hasGradient?: boolean
  showText?: boolean
}

interface CategoryIconProps extends IconProps {
  category: ProposalCategory
  hasGradient?: boolean
}

export function CategoryIcon({ category, hasGradient = false, ...props }: CategoryIconProps) {
  const icons = {
    [ProposalCategory.Grants]: (
      <GrantsIcon hasGradient={hasGradient} data-testid="ProposalType_Grants" {...props} />
    ),
    [ProposalCategory.Activation]: (
      <HammerIcon hasGradient={hasGradient} data-testid="ProposalType_Activation" {...props} />
    ),
    [ProposalCategory.Deactivation]: (
      <HammerIcon hasGradient={hasGradient} data-testid="ProposalType_Deactivation" {...props} />
    ),
    [ProposalCategory.Milestone1]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_1}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone1"
        {...props}
      />
    ),
    [ProposalCategory.Milestone2]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_2}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone2"
        {...props}
      />
    ),
    [ProposalCategory.Milestone3]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_3}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone3"
        {...props}
      />
    ),
    [ProposalCategory.Milestone4]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_4}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone4"
        {...props}
      />
    ),
    [ProposalCategory.Milestone5]: (
      <MilestoneIcon
        milestone={Milestones.MILESTONE_5}
        hasGradient={hasGradient}
        data-testid="ProposalType_Milestone5"
        {...props}
      />
    ),
  } as const satisfies Record<ProposalCategory, React.JSX.Element>

  return icons[category]
}

export function Category({ category, hasGradient = false, className, showText = false, ...props }: Props) {
  return (
    <Tooltip text={category}>
      <div className={cn('cursor-default flex items-center gap-2', className)} {...props}>
        <CategoryIcon category={category} hasGradient={hasGradient} />
        {showText && (
          <Span variant="body-s" className="text-bg-0">
            {category}
          </Span>
        )}
      </div>
    </Tooltip>
  )
}
