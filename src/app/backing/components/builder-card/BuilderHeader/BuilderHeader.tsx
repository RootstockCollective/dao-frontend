import { Header } from '@/components/TypographyNew'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { FC } from 'react'
import { cn } from '@/lib/utils'

interface BuilderHeaderProps {
  address: string
  name: string
  onNameClick?: () => void
  className?: string
}

export const BuilderHeader: FC<BuilderHeaderProps> = ({ address, name, onNameClick, className }) => {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="rounded-full overflow-hidden inline-block size-[88px]">
        <Jdenticon className="bg-white" value={address} size="88" />
      </div>
      <Header className="mt-2 text-center text-[22px] text-[#FF7A00] font-bold" fontFamily="kk-topo">
        <div className="cursor-pointer" onClick={onNameClick}>
          {name}
        </div>
      </Header>
    </div>
  )
}
