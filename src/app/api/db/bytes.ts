/**
 * Helpers for comparing against and reading state-sync `Bytes` columns.
 *
 * state-sync maps `Bytes` to Postgres `bytea` (`src/handlers/dbCreator.ts`) but writes the string
 * GraphQL returned without converting it, so Postgres applies `byteain`. `"0x…"` does not start
 * with `\x`, so it takes the **escape** format, where every character becomes its own byte: the
 * column holds the 42 ASCII bytes of an address, not the 20 raw ones. The same is true of string
 * ids such as the subgraph's `global` counter row.
 *
 * Getting this wrong returns an empty result rather than an error, which is why it lives in one
 * place with the reasoning attached.
 */

/** Encodes a hex address or string id for comparison against a `Bytes` column. */
export function toDbBytes(value: string): Buffer {
  return Buffer.from(value, 'utf8')
}

/** Decodes a `Bytes` column back to the string the subgraph returned. Lowercased. */
export function fromDbBytes(value: unknown): string {
  if (Buffer.isBuffer(value)) return value.toString('utf8').toLowerCase()
  return String(value).toLowerCase()
}
