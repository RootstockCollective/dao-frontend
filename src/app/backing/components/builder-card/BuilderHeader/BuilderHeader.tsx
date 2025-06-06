import { Header } from '@/components/TypographyNew'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { FC } from 'react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

interface BuilderHeaderProps {
  address: string
  name: string
  builderPageLink: string
  className?: string
}

export const BuilderHeader: FC<BuilderHeaderProps> = ({ address, name, builderPageLink, className }) => {
  return (
    // TODO: do we want the whole header to redirect to the Builder page?
    <div className={cn('flex flex-col items-center', className)} data-testid="builderHeaderContainer">
      <div className="rounded-full overflow-hidden inline-block size-[88px]" data-testid="builderAvatar">
        <Jdenticon className="bg-v3-text-100" value={address} size="88" />
      </div>
      <Header className="mt-2 text-center text-[22px] text-v3-primary font-bold" fontFamily="kk-topo">
        <Link
          href={builderPageLink || '#'}
          data-testid="builderName"
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </Link>
      </Header>
    </div>
  )
}
