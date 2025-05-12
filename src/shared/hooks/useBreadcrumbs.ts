import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { sidebarData } from '@/components/LeftSidebar'

// A map that links known URL path segments (hrefs) to human-readable breadcrumb titles.
// Generated from sidebarData used in the LeftSidebar component.
const breadcrumbsMap = Object.fromEntries(sidebarData.map(({ href, text }) => [href, text])) as {
  [K in (typeof sidebarData)[number] as K['href']]: K['text']
}

/**
 * A custom React hook that returns the breadcrumb trail based on the current URL path.
 * It splits the path, maps each segment to a human-readable title using breadcrumbsMap,
 * and constructs an array of `{ href, title }` objects for use in breadcrumb navigation UI.
 */
export function useBreadcrumbs() {
  const pathname = usePathname()
  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const title = breadcrumbsMap[segment as keyof typeof breadcrumbsMap] || decodeURIComponent(segment)
      return { href, title }
    })

    return [{ href: '/', title: 'Home' }, ...crumbs]
  }, [pathname])
}
