import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon, ToolsIcon, Milestone1Icon, Milestone2Icon, Milestone3Icon } from '../icons'
import { ProposalCategory } from '@/shared/types'
import { ClassNameValue } from 'tailwind-merge'
import { cn } from '@/lib/utils'

interface Props {
  category: ProposalCategory
  className?: ClassNameValue
  hasGradient?: boolean
}

export function CategoryColumn({ category, className, hasGradient = false }: Props) {
  const icons = {
    [ProposalCategory.Grants]: <GrantsIcon />,
    [ProposalCategory.Activation]: <ToolsIcon />,
    [ProposalCategory.Deactivation]: <ToolsIcon />,
    [ProposalCategory.Milestone1]: <Milestone1Icon hasGradient={hasGradient} />,
    [ProposalCategory.Milestone2]: <Milestone2Icon hasGradient={hasGradient} />,
    [ProposalCategory.Milestone3]: <Milestone3Icon hasGradient={hasGradient} />,
  } as const satisfies Record<ProposalCategory, React.JSX.Element>

  return (
    <div className={cn('w-full flex justify-center', className)}>
      <Tooltip text={category}>
        <div>{icons[category]}</div>
      </Tooltip>
    </div>
  )
}
