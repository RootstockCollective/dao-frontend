import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'

import { Jdenticon } from '@/components/Header/Jdenticon'
import { applyPinataImageOptions, ipfsGatewayUrl } from '@/lib/ipfs'
import { cn } from '@/lib/utils'

const RESOLUTION_MULTIPLIER = 2

interface IpfsAvatarProps {
  address: Address
  imageIpfs?: string | null
  name?: string
  size?: number
  className?: string
  fallbackClassName?: string
  fallbackValue?: string
}

export const IpfsAvatar = ({
  imageIpfs,
  address,
  name,
  size = 88,
  className,
  fallbackClassName = 'bg-v3-text-100',
  fallbackValue,
}: IpfsAvatarProps) => {
  const imageUrl = useMemo(() => {
    if (!imageIpfs) return null
    const gatewayUrl = ipfsGatewayUrl(imageIpfs)
    if (!gatewayUrl) return null
    return applyPinataImageOptions(gatewayUrl, {
      width: size * RESOLUTION_MULTIPLIER,
      height: size * RESOLUTION_MULTIPLIER,
      fit: 'cover',
      format: 'webp',
    })
  }, [imageIpfs, size])

  const [imageError, setImageError] = useState(false)

  useEffect(() => setImageError(false), [imageUrl])

  return (
    <div
      className={cn('rounded-full overflow-hidden inline-block', className)}
      style={{ width: size, height: size }}
      data-testid="ipfsAvatar"
    >
      {imageUrl && !imageError ? (
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
      ) : (
        <Jdenticon
          className={fallbackClassName}
          value={fallbackValue ?? address.toLowerCase()}
          size={size.toString()}
        />
      )}
    </div>
  )
}
