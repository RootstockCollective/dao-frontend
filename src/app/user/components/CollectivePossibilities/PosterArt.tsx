import { MoleculeIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'

import { POSTER_SRC } from './constants'

interface PosterArtProps {
  moleculeSize: number
  imageClassName?: string
  moleculeClassName?: string
}

export const PosterArt = ({ moleculeSize, imageClassName, moleculeClassName }: PosterArtProps) => (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={POSTER_SRC}
      alt=""
      aria-hidden="true"
      className={cn('absolute inset-0 size-full object-cover', imageClassName)}
    />
    <div className={cn('absolute inset-0 flex items-center justify-center', moleculeClassName)}>
      <MoleculeIcon size={moleculeSize} className="text-warm-surface-raised" />
    </div>
  </>
)
