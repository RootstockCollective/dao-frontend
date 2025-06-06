import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

interface InfoIconButtonProps extends CommonComponentProps {
  info: string
}

export const InfoIconButton: FC<InfoIconButtonProps> = ({ info, className = '' }) => (
  <div data-testid="InfoIconButton" className={cn('pt-1 items-center flex gap-2', className)}>
    <Tooltip text={info}>
      <KotoQuestionMarkIcon />
    </Tooltip>
    {/* FIXME: </Popover> */}
  </div>
)
