import type { Knex } from 'knex'

// ---------- Types ----------

export type CsvValue = string | number | boolean | null

// ---------- Utils ----------

/**
 * Escapes a CSV value according to RFC 4180
 * @param value - The value to escape
 * @returns The escaped CSV string
 */
export function escapeCsv(value: CsvValue): string {
  if (value === null) return ''
  const str = String(value)
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * Creates a ReadableStream that converts a Knex query result into CSV format
 * @param qb - The Knex QueryBuilder to stream results from
 * @returns A ReadableStream that yields CSV-formatted data
 */
export function createCsvReadableStream(qb: Knex.QueryBuilder): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // 1) Get the Knex stream (Node.js Readable)
      const nodeStream = qb.stream()

      // 2) Tell TS we will `for await` it as Record<string, CsvValue>
      const asyncStream = nodeStream as unknown as AsyncIterable<Record<string, CsvValue>> & {
        destroy(): void
      }

      let wroteHeader = false
      let headers: string[] = []

      try {
        for await (const row of asyncStream) {
          if (!wroteHeader) {
            headers = Object.keys(row)
            const headerLine = headers.join(',') + '\n'
            controller.enqueue(encoder.encode(headerLine))
            wroteHeader = true
          }

          const line = headers.map(h => escapeCsv(row[h] as CsvValue)).join(',') + '\n'

          controller.enqueue(encoder.encode(line))
        }

        controller.close()
      } catch (err) {
        console.error('Error while streaming CSV:', err)
        controller.error(err)
      } finally {
        asyncStream.destroy()
      }
    },
  })
}

/**
 * Creates a Response object for CSV download
 * @param stream - The CSV ReadableStream
 * @param filename - The filename for the download
 * @returns A Response object with appropriate headers
 */
export function createCsvResponse(stream: ReadableStream<Uint8Array>, filename: string): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
