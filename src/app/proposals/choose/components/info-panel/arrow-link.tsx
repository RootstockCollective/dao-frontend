import { PropsWithChildren } from 'react'
import ArrowIcon from './icons/arrow-icon'

interface OrangeLinkProps extends PropsWithChildren {
  href: string
}

export function ArrowLink({ href, children }: OrangeLinkProps) {
  return (
    <a
      className="mt-2 w-fit block leading-none hover:underline decoration-primary text-primary"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {children}
      &nbsp;
      <ArrowIcon />
    </a>
  )
}
