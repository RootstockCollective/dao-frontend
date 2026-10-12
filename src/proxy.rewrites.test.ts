// @vitest-environment node
import { createRequire } from 'node:module'
import { beforeAll, describe, expect, it } from 'vitest'

import nextConfig from '../next.config.mjs'
import { config } from './proxy'

interface Rewrite {
  source: string
  destination: string
}

interface RouteMatcher {
  match: (pathname: string) => unknown
}

const require = createRequire(import.meta.url)
const { default: loadCustomRoutes } = require('next/dist/lib/load-custom-routes') as {
  default: (
    config: typeof nextConfig,
  ) => Promise<{ rewrites: Record<'beforeFiles' | 'afterFiles' | 'fallback', Rewrite[]> }>
}
const { buildCustomRoute } = require('next/dist/server/lib/router-utils/filesystem') as {
  buildCustomRoute: (type: string, route: Rewrite, basePath?: string, caseSensitive?: boolean) => RouteMatcher
}
const { getMiddlewareMatchers } = require('next/dist/build/analysis/get-page-static-info') as {
  getMiddlewareMatchers: (matcher: typeof config.matcher, nextConfig: object) => { regexp: string }[]
}

const SAMPLE_PATHS = [
  '/ingest/e/',
  '/ingest/flags/',
  '/ingest/array/phc_test/config',
  '/monitoring',
  '/monitoring/',
]

const proxyMatchers = getMiddlewareMatchers(config.matcher, {}).map(({ regexp }) => new RegExp(regexp))
const isExternal = ({ destination }: Rewrite) => /^https?:\/\//.test(destination)

describe('rewrites to third-party hosts', () => {
  let externalRewrites: RouteMatcher[]

  beforeAll(async () => {
    const { rewrites } = await loadCustomRoutes(nextConfig)
    const { basePath, experimental } = nextConfig
    // Same arguments as Next's router (server/lib/router-utils/filesystem.js).
    externalRewrites = [
      ...rewrites.beforeFiles
        .filter(isExternal)
        .map(route => buildCustomRoute('before_files_rewrite', route)),
      ...[...rewrites.afterFiles, ...rewrites.fallback]
        .filter(isExternal)
        .map(route => buildCustomRoute('rewrite', route, basePath, experimental?.caseSensitiveRoutes)),
    ]
  })

  it('each has a sample path', () => {
    expect(externalRewrites.length).toBeGreaterThan(0)
    for (const rewrite of externalRewrites) {
      expect(SAMPLE_PATHS.some(path => rewrite.match(path))).toBe(true)
    }
  })

  it.each(SAMPLE_PATHS)('runs the proxy on %s', path => {
    expect(proxyMatchers.some(regexp => regexp.test(path))).toBe(true)
  })

  it.each(SAMPLE_PATHS.map(path => path.toUpperCase()))('does not rewrite %s', path => {
    expect(externalRewrites.some(rewrite => rewrite.match(path))).toBe(false)
  })

  it.each(['/ingest/static/array.js', '/ingest/static/recorder.js', '/ingest/array/phc_test/config.js'])(
    'does not proxy the PostHog script %s',
    path => {
      expect(externalRewrites.some(rewrite => rewrite.match(path))).toBe(false)
    },
  )
})
