import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon, HammerIcon } from '../icons'
import { ProposalCategory } from '@/shared/types'
import { ClassNameValue } from 'tailwind-merge'
import { cn } from '@/lib/utils'
import { MilestoneIcon } from '../MilestoneIcon'
import { Milestones } from '../../shared/types'

interface Props {
  category: ProposalCategory
  className?: ClassNameValue
  hasGradient?: boolean
}

export function Category({ category, className, hasGradient = false }: Props) {
  const icons = {
    [ProposalCategory.Grants]: <GrantsIcon hasGradient={hasGradient} />,
    [ProposalCategory.Activation]: <HammerIcon hasGradient={hasGradient} />,
    [ProposalCategory.Deactivation]: <HammerIcon hasGradient={hasGradient} />,
    [ProposalCategory.Milestone1]: (
      <MilestoneIcon milestone={Milestones.MILESTONE_1} hasGradient={hasGradient} />
    ),
    [ProposalCategory.Milestone2]: (
      <MilestoneIcon milestone={Milestones.MILESTONE_2} hasGradient={hasGradient} />
    ),
    [ProposalCategory.Milestone3]: (
      <MilestoneIcon milestone={Milestones.MILESTONE_3} hasGradient={hasGradient} />
    ),
  } as const satisfies Record<ProposalCategory, React.JSX.Element>

  return (
    <div className={cn('w-full flex justify-center', className)}>
      <Tooltip text={category}>
        <div>{icons[category]}</div>
      </Tooltip>
    </div>
  )
}
