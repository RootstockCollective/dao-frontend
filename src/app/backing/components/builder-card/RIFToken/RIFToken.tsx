import { TokenImage } from '@/components/TokenImage'
import { RIF } from '@/lib/constants'
import { FC } from 'react'

export const RIFToken: FC = () => {
  return (
    <div
      className="flex items-center gap-1 flex-shrink-0 font-rootstock-sans"
      data-testid="currentBackingToken"
    >
      <TokenImage symbol={RIF} size={16} />
      <div className="text-xs text-white">stRIF</div>
    </div>
  )
}
