import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import { menuData } from '../MainContainer'
import { communitiesToRender } from '@/app/communities/communityUtils'

const menuBreadCrumbsMap = Object.fromEntries(menuData.map(({ href, text }) => [href, text])) as {
  [K in (typeof menuData)[number] as K['href']]: K['text']
}

// A map that links known URL paths to human-readable breadcrumb titles.
// Using full paths to avoid conflicts between similar segments in different routes
const breadcrumbsMap = {
  ...menuBreadCrumbsMap,
  '/proposals/new': 'New Proposal',
  '/proposals/new/details': 'Details',
  '/proposals/new/review': 'Review Details',
  '/proposals/new/details/grants': 'Create Grant Proposal',
  '/proposals/new/details/activation': 'Create Activation Proposal',
  '/proposals/new/details/deactivation': 'Create Deactivation Proposal',
  '/proposals/new/review/grants': 'Review Grant Proposal',
  '/proposals/new/review/activation': 'Review Activation Proposal',
  '/proposals/new/review/deactivation': 'Review Deactivation Proposal',
  // community URLs
  ...Object.fromEntries(
    communitiesToRender.map(({ nftAddress, title }) => [`/communities/nft/${nftAddress}`, title]),
  ),
  // Add more specific routes here as needed
}

// Segments that should be skipped in breadcrumbs (no clickable links)
const skipSegments = ['/proposals/new/review', '/proposals/new/details', '/communities/nft']

/**
 * Simple breadcrumbs component used in desktop header
 */
export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments
      .map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        // First try to match the full path, then fall back to segment-based lookup
        const title =
          breadcrumbsMap[href as keyof typeof breadcrumbsMap] ||
          breadcrumbsMap[segment as keyof typeof breadcrumbsMap] ||
          decodeURIComponent(segment)

        return { href, title }
      })
      .filter(crumb => !skipSegments.includes(crumb.href))

    return [{ href: '/', title: 'Home' }, ...crumbs]
  }, [pathname])

  return (
    <nav aria-label="breadcrumb" className="ml-5">
      <ol className="flex gap-2">
        {breadcrumbs.map(({ title, href }, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <li key={href} className="flex items-center gap-2">
              {isLast ? (
                <span className="text-sm text-text-100 truncate inline-block max-w-[150px]">{title}</span>
              ) : (
                <>
                  <Link href={href} className="text-sm text-warm-gray hover:underline">
                    {title}
                  </Link>
                  <span className="text-warm-gray">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
