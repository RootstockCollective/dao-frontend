import { Jdenticon } from '@/components/Header/Jdenticon'
import { FC, useState } from 'react'
import Image from 'next/image'
import { Address } from 'viem'
import { ipfsGatewayUrl } from '@/lib/ipfs'
import { cn } from '@/lib/utils'

interface IpfsAvatarProps {
  address: Address
  imageIpfs?: string | null
  name?: string
  size?: number
  className?: string
}

export const IpfsAvatar = ({ imageIpfs, address, name, size = 88, className }: IpfsAvatarProps) => {
  const imageUrl = imageIpfs ? ipfsGatewayUrl(imageIpfs) : null
  const [imageError, setImageError] = useState(false)

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
        <Jdenticon className="bg-v3-text-100" value={address.toLowerCase()} size={size.toString()} />
      )}
    </div>
  )
}
