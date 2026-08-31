import Image from 'next/image'
import { useState } from 'react'
import { Address } from 'viem'

import { Jdenticon } from '@/components/Header/Jdenticon'
import { ipfsGatewayUrl } from '@/lib/ipfs'
import { cn } from '@/lib/utils'

interface IpfsAvatarProps {
  address: Address
  /**
   * Image reference. Accepts a root-relative path to an asset served from
   * `public/` (e.g. `/images/builders/foo.svg`), a bare IPFS CID, or a full
   * gateway URL. Falls back to a generated identicon when absent or broken.
   */
  image?: string | null
  name?: string
  size?: number
  className?: string
  /**
   * Background for the generated-identicon fallback only. Identicons are dark
   * marks on a transparent canvas and need a light backing; real logos must NOT
   * get one — several ship as white-on-transparent and vanish against it.
   */
  fallbackClassName?: string
}

/**
 * Root-relative paths are served by Next directly and must not be run through
 * the IPFS gateway — they also need no `remotePatterns` entry, which is why
 * curated builder icons can ship as repo assets without extra configuration.
 */
const resolveImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  return image.startsWith('/') ? image : ipfsGatewayUrl(image)
}

export const IpfsAvatar = ({
  image,
  address,
  name,
  size = 88,
  className,
  fallbackClassName = 'bg-v3-text-100',
}: IpfsAvatarProps) => {
  const imageUrl = resolveImageUrl(image)
  const [imageError, setImageError] = useState(false)
  const showFallback = !imageUrl || imageError

  return (
    <div
      className={cn('rounded-full overflow-hidden inline-block', className)}
      style={{ width: size, height: size }}
      data-testid="ipfsAvatar"
    >
      {showFallback ? (
        <Jdenticon className={fallbackClassName} value={address.toLowerCase()} size={size.toString()} />
      ) : (
        <Image
          src={imageUrl}
          alt={name || `Avatar for ${address}`}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          crossOrigin="anonymous"
          unoptimized
        />
      )}
    </div>
  )
}
