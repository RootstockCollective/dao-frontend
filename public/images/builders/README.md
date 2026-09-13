# Builder icons

Curated builder icons for ROO-94, referenced from the `dao_data.BuilderProfiles`
table by root-relative path (e.g. `/images/builders/moneyonchain.svg`).

Assets live here rather than on IPFS so that:

- no `images.remotePatterns` entry is needed in `next.config.mjs` — a local path is
  not a remote image;
- they render in local development, which the Pinata gateway does not allow without
  `NEXT_PUBLIC_PINATA_GATEWAY_KEY` (see `src/lib/README-IPFS.md`).

## Adding an icon

1. Drop the asset here. Prefer SVG; otherwise a square PNG/WebP of at least 176px
   (the largest render is the 88px card avatar at 2x).
2. Add an entry to `prisma/seed/builder-profiles.json`.
3. Run `npm run db:seed:builders`.

The manifest is the source of truth: the seed upserts every listed builder and
**prunes** rows that are no longer listed, so removing an entry also removes it
from the database rather than leaving it pointing at a deleted asset.

## Choosing an asset

The avatar is a circle on a dark background, at 88px (card) and 40px (table rows).
That rules out two things that look fine elsewhere:

- **Wordmarks.** A horizontal logo gets cropped to its middle. Use the square mark.
- **Marks that are black on a transparent canvas.** They vanish against the dark
  background. Logos that carry their own solid background are safest; white-on-
  transparent works too. The white backing in the table cells applies only to the
  generated-identicon fallback, never behind a real logo.

Check a new asset at 40px before committing it — that is where a detailed
illustration turns into an unreadable smudge.

A builder with no row, or with `image` null, falls back to a generated identicon —
the current behaviour — so a missing icon is never a broken image.

## Moving an icon to IPFS later

The `image` column also accepts a bare IPFS CID: `IpfsAvatar` routes anything that
does not start with `/` through the Pinata gateway. Switching a builder over is an
`UPDATE` on that row, with no schema or component change.
