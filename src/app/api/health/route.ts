import { NextResponse } from 'next/server'
import { type HealthCheckType, runHealthCheck } from './healthCheck'
import { WrongHealthCheckTypeError } from './healthCheck.errors'

export async function GET(_: Request, { params }: { params: Promise<{ type?: HealthCheckType }> }) {
  const healthCheckType: HealthCheckType = (await params)?.type ?? 'all'
  return runHealthCheck(healthCheckType)
    .then(result => NextResponse.json(result, { status: 200 }))
    .catch(err => {
      if (err instanceof WrongHealthCheckTypeError) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      console.error(`Health check failed for type "${healthCheckType}":`, err)

      return NextResponse.json(
        { error: `Health check failed for type "${healthCheckType}"` },
        { status: 500 },
      )
    })
}
