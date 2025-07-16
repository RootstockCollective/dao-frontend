import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon } from './icons/GrantsIcon'
import { ToolsIcon } from './icons/ToolsIcon'
import { ProposalCategory } from '@/shared/types'
import { TreasuryIcon } from './icons/TreasuryIcon'
import { ClassNameValue } from 'tailwind-merge'
import { cn } from '@/lib/utils'

const icons = {
  [ProposalCategory.Grants]: <GrantsIcon />,
  [ProposalCategory.Builder]: <ToolsIcon />,
  [ProposalCategory.Treasury]: <TreasuryIcon />,
} as const satisfies Record<ProposalCategory, React.JSX.Element>

interface Props {
  category: ProposalCategory
  className?: ClassNameValue
}

export function CategoryColumn({ category, className }: Props) {
  return (
    <div className={cn('w-full flex justify-center', className)}>
      <Tooltip text={category}>
        <div>{icons[category]}</div>
      </Tooltip>
    </div>
  )
}
