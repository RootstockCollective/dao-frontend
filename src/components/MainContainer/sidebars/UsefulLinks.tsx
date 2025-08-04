import { Link } from '@/components/Link'
import { usefulLinksData } from './usefulLinksData'
import { HTMLAttributes } from 'react'
import { Label, Span } from '@/components/TypographyNew'

export const UsefulLinks = (props: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    <Label variant="tag" className="text-warm-gray">
      Useful links
    </Label>
    <ul className="mt-2 space-y-1">
      {usefulLinksData.map(({ href, testId, content }) => (
        <li key={href}>
          <Link
            href={href}
            variant="menu"
            className="text-sm text-warm-gray no-underline hover:underline"
            target="_blank"
            data-testid={testId}
          >
            <Span variant="body-s" bold>
              {content}
            </Span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
)
