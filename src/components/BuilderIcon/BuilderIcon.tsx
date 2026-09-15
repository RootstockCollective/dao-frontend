'use client'

import { Address } from 'viem'

import { IpfsAvatar } from '@/components/IpfsAvatar'
import { getBuilderIconCid } from '@/lib/builderIcons'

export interface BuilderIconProps {
  /** Builder address — used both to look up the icon and to seed the fallback identicon */
  address: Address
  /**
   * Explicit IPFS CID, taking precedence over the registry. Lets callers that already
   * have the metadata (e.g. delegates) reuse this component without a registry entry.
   */
  imageIpfs?: string | null
  /** Builder name, used for the image alt text */
  name?: string
  /** Rendered size in pixels */
  size?: number
  className?: string
  /** Classes applied to the identicon fallback (defaults to the white circle used in tables) */
  fallbackClassName?: string
  /**
   * Seed for the identicon fallback. Defaults to the address as given, which preserves the
   * identicons already shown before builder icons existed.
   */
  fallbackValue?: string
}

/**
 * A builder's avatar: the explicit `imageIpfs` when given, otherwise the icon configured
 * in `BUILDER_ICON_CIDS` for this address, otherwise the generated identicon.
 */
export const BuilderIcon = ({
  address,
  imageIpfs,
  name,
  size = 40,
  className,
  fallbackClassName = 'bg-white',
  fallbackValue,
}: BuilderIconProps) => (
  <IpfsAvatar
    address={address}
    imageIpfs={imageIpfs ?? getBuilderIconCid(address)}
    name={name}
    size={size}
    className={className}
    fallbackClassName={fallbackClassName}
    fallbackValue={fallbackValue ?? address}
  />
)
