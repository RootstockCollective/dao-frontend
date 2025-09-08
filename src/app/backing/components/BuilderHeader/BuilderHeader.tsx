import { Header } from '@/components/Typography'
import { IpfsAvatar } from '@/components/IpfsAvatar'
import { ComponentProps, FC } from 'react'
import { cn, shortAddress, truncate } from '@/lib/utils'
import Link from 'next/link'
import { Address } from 'viem'

interface BuilderHeaderProps {
  address: Address
  name?: string
  imageIpfs?: string | null
  builderPageLink?: string
  className?: string
  showFullName?: boolean
  shouldNotRedirect?: boolean
  headerProps?: ComponentProps<typeof Header>
}

export const BuilderHeader: FC<BuilderHeaderProps> = ({
  address,
  name,
  imageIpfs,
  builderPageLink,
  className,
  showFullName = true,
  shouldNotRedirect = false,
  headerProps,
}) => {
  const shortedAddress = shortAddress(address)
  const truncatedName = name ? (showFullName ? name : truncate(name, 15)) : undefined

  return (
    // TODO: do we want the whole header to redirect to the Builder page?
    <div
      className={cn('flex flex-col items-center max-w-[90%] overflow-hidden', className)}
      data-testid="builderHeaderContainer"
    >
      <div data-testid="builderAvatar">
        <IpfsAvatar imageIpfs={imageIpfs} address={address} name={name || shortedAddress} size={88} />
      </div>
      <Header
        className="mt-2 text-center text-v3-primary"
        variant="h2"
        title={name || address}
        {...headerProps}
      >
        {shouldNotRedirect ? (
          <>{truncatedName || shortedAddress}</>
        ) : (
          <Link
            href={builderPageLink || '#'}
            data-testid="builderName"
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[200px] hover:relative group"
            title={name || address}
          >
            {truncatedName || shortedAddress}
          </Link>
        )}
      </Header>
    </div>
  )
}
