import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'

import type { ProviderLink } from '../config'

interface ProviderCardProps {
  provider: ProviderLink
  onOpen: (url: string) => void
}

/**
 * One place the user can go to acquire a token. Opens in a new tab and deliberately does not
 * advance the step: the user is coming back, and losing their place would be hostile.
 *
 * An anchor rather than a button, even though the click is handled in JS: this is a
 * navigation, and only an anchor gives the user middle-click, cmd-click, "copy link address",
 * and the "opens in a new tab" that assistive tech announces from `target`.
 */
export const ProviderCard = ({ provider, onOpen }: ProviderCardProps) => {
  const { Icon } = provider

  return (
    <a
      href={provider.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={event => {
        // Let the browser handle any modified click (new tab, new window, download) itself.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return
        }

        event.preventDefault()
        onOpen(provider.url)
      }}
      className="bg-text-100 hover:bg-text-60 focus-visible:outline-bg-100 flex w-full flex-row items-center gap-4 rounded-2xl p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      data-testid={`provider-card-${provider.name.toLowerCase()}`}
    >
      {/* Decorative: the provider name is right next to it, so the icon announcing its own
          brand name again would just double every row's accessible name. */}
      <Icon size={40} className="shrink-0" aria-hidden />

      <span className="min-w-0 flex-1">
        <Span variant="body" bold className="text-bg-100 block">
          {provider.name}
        </Span>
        {/* `bg-60` not `bg-40`: on the card's hover colour `bg-40` drops to 3.99:1. */}
        <Span variant="body-s" className="text-bg-60 block">
          {provider.tagline}
        </Span>
      </span>

      <ArrowUpRightLightIcon size={20} color="var(--color-bg-100)" aria-hidden />
    </a>
  )
}
