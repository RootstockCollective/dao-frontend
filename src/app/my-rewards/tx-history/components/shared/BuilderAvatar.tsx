'use client'

import { Jdenticon } from '@/components/Header/Jdenticon'
import { Paragraph } from '@/components/Typography'
import { cn, shortAddress, truncate } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import Link from 'next/link'
import { Address } from 'viem'

export interface BuilderAvatarProps {
  builder?: Builder
  builderAddress?: Address
  variant: 'desktop' | 'mobile'
  isHovered?: boolean // desktop only
  className?: string
}

const BUILDER_NAME_MAX_LENGTH = 15

/**
 * Shared component for displaying a builder's avatar with their name/address.
 * Includes an optional link to the builder's proposal page.
 */
export const BuilderAvatar = ({
  builder,
  builderAddress,
  variant,
  isHovered = false,
  className,
}: BuilderAvatarProps) => {
  const isDesktop = variant === 'desktop'

  const address = builder?.address ?? builderAddress ?? ''
  const shortedAddress = shortAddress(address as Address)

  const builderName = builder?.builderName || ''
  const displayName = builderName ? truncate(builderName, BUILDER_NAME_MAX_LENGTH) : shortedAddress

  const hasProposalLink = builder?.proposal?.id

  const textColor = isDesktop && isHovered ? 'text-black' : 'text-v3-primary'

  const avatarSizeClass = isDesktop ? 'min-w-10 size-10' : ''

  return (
    <div className={cn('flex items-center gap-2', isDesktop && 'gap-3', className)}>
      <Jdenticon
        className={cn('rounded-full bg-white', avatarSizeClass)}
        value={builderAddress ?? address}
        size={isDesktop ? '40' : '32'}
      />
      <div className={cn('flex items-center', isDesktop && 'min-w-0 flex-1')}>
        {hasProposalLink ? (
          <Link
            href={`/proposals/${builder.proposal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(isDesktop && 'min-w-0 flex-1')}
          >
            <Paragraph
              className={cn(
                'hover:underline',
                textColor,
                isDesktop &&
                  'hover:underline-offset-2 truncate overflow-hidden text-ellipsis whitespace-nowrap',
              )}
            >
              {displayName}
            </Paragraph>
          </Link>
        ) : (
          <Paragraph className={textColor}>{displayName}</Paragraph>
        )}
      </div>
    </div>
  )
}

export interface MultipleBuildersAvatarProps {
  variant: 'desktop' | 'mobile'
  isHovered?: boolean // desktop only
  className?: string
}

/**
 * Component for displaying the "Multiple Builders" grouped row indicator.
 */
export const MultipleBuildersAvatar = ({
  variant,
  isHovered = false,
  className,
}: MultipleBuildersAvatarProps) => {
  const isDesktop = variant === 'desktop'
  const textColor = isDesktop && isHovered ? 'text-black' : 'text-v3-primary'

  return (
    <div className={cn('flex items-center gap-2', isDesktop && 'gap-3', className)}>
      <div className={cn('rounded-full bg-v3-rsk-purple', isDesktop ? 'min-w-10 size-10' : 'w-8 h-8')} />
      <div className={cn('flex items-center', isDesktop && 'min-w-0 flex-1')}>
        <Paragraph className={cn(textColor, !isDesktop && 'truncate max-w-[120px]')}>
          Multiple Builders
        </Paragraph>
      </div>
    </div>
  )
}
