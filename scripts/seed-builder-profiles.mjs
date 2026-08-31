#!/usr/bin/env node
/**
 * Seeds the curated builder configuration (`dao_data.BuilderProfiles`) from
 * `prisma/seed/builder-profiles.json`.
 *
 * The manifest is the source of truth. Entries are upserted by address and rows
 * that are no longer listed are pruned, so the script is idempotent and removing
 * an entry also removes it from the database rather than leaving it pointing at a
 * deleted asset. Entries whose address is not a well-formed 0x address are
 * skipped with a warning.
 *
 * Usage:
 *   npm run db:up            # local dao-data postgres
 *   npm run db:migrate:dao
 *   npm run db:seed:builders
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// Mirror next.config.mjs: PROFILE selects which .env file to load.
const profile = process.env.PROFILE || ''
const envPath = profile.startsWith('.env.') ? profile : profile ? `.env.${profile}` : '.env'
config({ path: [resolve(rootDir, 'apis.conf'), resolve(rootDir, envPath)], override: true })

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

const manifestPath = resolve(rootDir, 'prisma/seed/builder-profiles.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

if (!Array.isArray(manifest)) {
  console.error(`Expected ${manifestPath} to contain an array.`)
  process.exit(1)
}

if (!process.env.DAO_DATA_DB_CONNECTION_STRING) {
  console.error('DAO_DATA_DB_CONNECTION_STRING is not set — nothing to seed against.')
  process.exit(1)
}

const prisma = new PrismaClient()

let seeded = 0
let skipped = 0
const seededAddresses = new Set()

try {
  for (const entry of manifest) {
    const address = String(entry?.address ?? '')

    if (!ADDRESS_RE.test(address)) {
      console.warn(`Skipping entry with invalid address: ${JSON.stringify(entry?.address)}`)
      skipped += 1
      continue
    }

    const image = entry.image ?? null
    const data = { address: address.toLowerCase(), image }

    await prisma.builderProfile.upsert({
      where: { address: data.address },
      update: { image },
      create: data,
    })

    seededAddresses.add(data.address)
    seeded += 1
    console.log(`Seeded ${data.address} -> ${image ?? '(no image)'}`)
  }

  // The manifest is the source of truth: drop rows for builders that are no
  // longer listed, otherwise removing an entry leaves a row pointing at an
  // asset that no longer exists in the repo.
  const { count: pruned } = await prisma.builderProfile.deleteMany({
    where: { address: { notIn: [...seededAddresses] } },
  })

  if (pruned) {
    console.log(`Pruned ${pruned} row(s) no longer in the manifest.`)
  }

  console.log(`\nDone. ${seeded} seeded, ${skipped} skipped, ${pruned} pruned.`)
} catch (error) {
  console.error('Seeding failed:', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
