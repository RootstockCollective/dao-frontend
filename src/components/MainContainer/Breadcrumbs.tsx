import { useBreadcrumbs } from '@/shared/hooks/useBreadcrumbs'
import Link from 'next/link'

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs()
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
