import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db('Builder')
      .count('Builder.id')
      .join('BuilderState', 'Builder.id', '=', 'BuilderState.builder')
      .where('BuilderState.kycApproved', '=', true)
      .where('BuilderState.communityApproved', '=', true)
      .where('BuilderState.initialized', '=', true)
      .where('BuilderState.selfPaused', '=', false)
      .first()

    return NextResponse.json(count)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
