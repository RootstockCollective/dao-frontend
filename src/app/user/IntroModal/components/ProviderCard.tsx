import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'

import type { ProviderLink } from '../config'

interface ProviderCardProps {
  provider: ProviderLink
  onOpen: (url: string) => void
}

/**
 * One place the user can go to acquire a token. Opens in a new tab and deliberately does not
 * advance the step: the user is coming back, and losing their place would be hostile.
 */
export const ProviderCard = ({ provider, onOpen }: ProviderCardProps) => {
  const { Icon } = provider

  return (
    <button
      type="button"
      onClick={() => onOpen(provider.url)}
      className="bg-text-100 hover:bg-text-60 flex w-full flex-row items-center gap-4 rounded-2xl p-4 text-left transition-colors"
      data-testid={`provider-card-${provider.name.toLowerCase()}`}
    >
      <Icon size={40} className="shrink-0" />

      <span className="min-w-0 flex-1">
        <Paragraph bold className="text-bg-100">
          {provider.name}
        </Paragraph>
        <Paragraph variant="body-s" className="text-bg-40">
          {provider.tagline}
        </Paragraph>
      </span>

      <ArrowUpRightLightIcon size={20} color="var(--color-bg-100)" />
    </button>
  )
}
