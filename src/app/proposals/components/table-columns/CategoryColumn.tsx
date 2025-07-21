import { Tooltip } from '@/components/Tooltip'
import { GrantsIcon } from './icons/GrantsIcon'
import { ToolsIcon } from './icons/ToolsIcon'
import { ProposalCategory } from '@/shared/types'

const icons = {
  [ProposalCategory.Grants]: <GrantsIcon />,
  [ProposalCategory.Activation]: <ToolsIcon />,
  [ProposalCategory.Deactivation]: <ToolsIcon />,
} as const satisfies Record<ProposalCategory, React.JSX.Element>

interface Props {
  category: ProposalCategory
}

export function CategoryColumn({ category }: Props) {
  return (
    <div className="w-full flex justify-center">
      <Tooltip text={category}>
        <div>{icons[category]}</div>
      </Tooltip>
    </div>
  )
}
