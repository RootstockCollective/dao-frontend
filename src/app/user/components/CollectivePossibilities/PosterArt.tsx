import { MoleculeIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'

export const POSTER_SRC = '/images/dont-miss-poster.webp'

interface PosterArtProps {
  moleculeSize: number
  /** Crop of the striped poster, e.g. `object-[70%_50%]`. */
  imageClassName?: string
  /** Placement of the molecule over the poster. Centred by default. */
  moleculeClassName?: string
}

/**
 * The still art behind the Don't Miss prompt: orange stripes with the Collective molecule cut
 * out of them in the surface color. It is what shows before the motion logo plays, and all
 * that shows when it does not.
 */
export const PosterArt = ({ moleculeSize, imageClassName, moleculeClassName }: PosterArtProps) => (
  <>
    {/* A 7 KB decorative texture whose crop changes with the layout; next/image adds nothing here */}
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
