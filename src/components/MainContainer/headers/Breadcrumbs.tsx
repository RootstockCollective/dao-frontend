import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import { menuData } from '../sidebars/menuData'

// A map that links known URL path segments (hrefs) to human-readable breadcrumb titles.
const breadcrumbsMap = Object.fromEntries(menuData.map(({ href, text }) => [href, text])) as {
  [K in (typeof menuData)[number] as K['href']]: K['text']
}

/**
 * Simple breadcrumbs component used in desktop header
 */
export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const title = breadcrumbsMap[segment as keyof typeof breadcrumbsMap] || decodeURIComponent(segment)
      return { href, title }
    })

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
                <span className="text-sm text-white">{title}</span>
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
