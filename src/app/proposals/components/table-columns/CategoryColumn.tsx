import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon } from './icons/GrantsIcon'
import { ToolsIcon } from './icons/ToolsIcon'
import { ProposalCategory } from '@/shared/types'
import { TreasuryIcon } from './icons/TreasuryIcon'

const icons = {
  [ProposalCategory.Grants]: <GrantsIcon />,
  [ProposalCategory.Builder]: <ToolsIcon />,
  [ProposalCategory.Treasury]: <TreasuryIcon />,
} as const satisfies Record<ProposalCategory, React.JSX.Element>

interface Props {
  category: ProposalCategory
}

export function CategoryColumn({ category }: Props) {
  return (
    <div className="flex justify-center">
      <Tooltip text={category}>
        <div>{icons[category]}</div>
      </Tooltip>
    </div>
  )
}
