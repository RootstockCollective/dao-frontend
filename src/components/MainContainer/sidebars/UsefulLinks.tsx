import { Paragraph } from '@/components/Typography/Paragraph'
import { Link } from '@/components/Link'
import { usefulLinksData } from './usefulLinksData'
import { HTMLAttributes } from 'react'

export const UsefulLinks = (props: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    <Paragraph className="text-base font-medium text-warm-gray">Useful links</Paragraph>
    <ul className="mt-6 space-y-2">
      {usefulLinksData.map(({ href, testId, content }) => (
        <li key={href}>
          <Link
            href={href}
            variant="menu"
            className="text-sm text-warm-gray no-underline hover:underline"
            target="_blank"
            data-testid={testId}
          >
            {content}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)
