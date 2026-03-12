import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LAG_THRESHOLD_BLOCKS = 500

async function fetchLastSyncedBlock(graphqlUrl: string, syncProgressId: string): Promise<number> {
  const syncProgressQuery = `
    query GetSyncProgress {
      SyncProgress(where: { id: { _eq: "${syncProgressId}" } }, limit: 1) {
        lastBlock
      }
    }
  `
  const syncRes = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: syncProgressQuery }),
  })
  if (!syncRes.ok) {
    throw new Error(`Envio SyncProgress query failed: ${syncRes.status}`)
  }
  const syncJson = (await syncRes.json()) as {
    data?: { SyncProgress?: Array<{ lastBlock: string }> }
    errors?: Array<{ message: string }>
  }
  if (syncJson.errors?.length) {
    throw new Error(`Envio GraphQL errors: ${syncJson.errors.map(e => e.message).join(', ')}`)
  }
  const rows = syncJson.data?.SyncProgress
  if (rows?.length && rows[0].lastBlock) {
    return Number(rows[0].lastBlock)
  }

  const proposalFallbackQuery = `
    query GetLatestProposalBlock {
      Proposal(order_by: { createdAtBlock: desc }, limit: 1) {
        createdAtBlock
      }
    }
  `
  const propRes = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: proposalFallbackQuery }),
  })
  if (!propRes.ok) {
    throw new Error(`Envio Proposal fallback query failed: ${propRes.status}`)
  }
  const propJson = (await propRes.json()) as {
    data?: { Proposal?: Array<{ createdAtBlock: string }> }
    errors?: Array<{ message: string }>
  }
  if (propJson.errors?.length) {
    throw new Error(`Envio GraphQL errors: ${propJson.errors.map(e => e.message).join(', ')}`)
  }
  const proposalRows = propJson.data?.Proposal
  if (proposalRows?.length && proposalRows[0].createdAtBlock) {
    return Number(proposalRows[0].createdAtBlock)
  }

  throw new Error('No SyncProgress or Proposal data from Envio')
}

async function fetchChainTip(rpcUrl: string): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }),
  })
  if (!res.ok) {
    throw new Error(`RPC eth_blockNumber failed: ${res.status}`)
  }
  const json = (await res.json()) as { result?: string; error?: { message: string } }
  if (json.error) {
    throw new Error(`RPC error: ${json.error.message}`)
  }
  if (typeof json.result !== 'string') {
    throw new Error('RPC eth_blockNumber: missing result')
  }
  return parseInt(json.result, 16)
}

async function postSlackAlert(
  webhookUrl: string,
  payload: { lastBlock: number; chainTip: number; lag: number; threshold: number },
): Promise<void> {
  const text = [
    `:warning: Envio indexer sync lag exceeds threshold.`,
    `Last synced block: ${payload.lastBlock}`,
    `Chain tip: ${payload.chainTip}`,
    `Lag: ${payload.lag} blocks (threshold: ${payload.threshold})`,
  ].join('\n')
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status} ${await res.text()}`)
  }
}

/**
 * GET /api/envio-sync-check
 *
 * Queries Envio for last synced block, compares to Rootstock Testnet chain tip,
 * and posts to Slack if lag exceeds threshold. Intended to be invoked on a
 * schedule (e.g. cron every N minutes).
 *
 * Auth: If ENVIO_SYNC_CHECK_SECRET is set, request must include
 * Authorization: Bearer <secret>; otherwise returns 401.
 *
 * Request: No body. Optional header: Authorization: Bearer <ENVIO_SYNC_CHECK_SECRET>.
 *
 * Response: 200 { success: true, lastBlock, chainTip, lag, threshold, alerted? };
 * 401 { success: false, error }; 502 { success: false, error }; 503 { success: false, error };
 * 500 { success: false, error, lastBlock?, chainTip?, lag? } (Slack failure).
 *
 * Env: ENVIO_GRAPHQL_URL, ENVIO_SYNC_CHECK_RPC_URL (Rootstock Testnet RPC for chain tip),
 * ENVIO_SYNC_CHECK_SYNC_PROGRESS_ID (optional, default "chain-31"),
 * ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL (optional),
 * ENVIO_SYNC_CHECK_LAG_THRESHOLD_BLOCKS (default 500), ENVIO_SYNC_CHECK_SECRET (optional).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.ENVIO_SYNC_CHECK_SECRET
  const graphqlUrl = process.env.ENVIO_GRAPHQL_URL
  const rpcUrl = process.env.ENVIO_SYNC_CHECK_RPC_URL
  const slackWebhookUrl = process.env.ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL
  const lagThresholdBlocks =
    Number(process.env.ENVIO_SYNC_CHECK_LAG_THRESHOLD_BLOCKS) || DEFAULT_LAG_THRESHOLD_BLOCKS
  const syncProgressChainId = process.env.ENVIO_SYNC_CHECK_SYNC_PROGRESS_ID ?? 'chain-31'

  if (secret) {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (token !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!graphqlUrl) {
    return NextResponse.json({ success: false, error: 'ENVIO_GRAPHQL_URL not configured' }, { status: 503 })
  }

  if (!rpcUrl) {
    return NextResponse.json(
      { success: false, error: 'ENVIO_SYNC_CHECK_RPC_URL not configured' },
      { status: 503 },
    )
  }

  let lastBlock: number
  try {
    lastBlock = await fetchLastSyncedBlock(graphqlUrl, syncProgressChainId)
  } catch (error) {
    console.error('Envio sync check: failed to fetch last synced block', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch last synced block from Envio' },
      { status: 502 },
    )
  }

  let chainTip: number
  try {
    chainTip = await fetchChainTip(rpcUrl)
  } catch (error) {
    console.error('Envio sync check: failed to fetch chain tip', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch chain tip from RPC' }, { status: 502 })
  }

  const lag = chainTip - lastBlock
  const alerted = slackWebhookUrl && lag > lagThresholdBlocks
  if (alerted && slackWebhookUrl) {
    try {
      await postSlackAlert(slackWebhookUrl, {
        lastBlock,
        chainTip,
        lag,
        threshold: lagThresholdBlocks,
      })
    } catch (error) {
      console.error('Envio sync check: failed to post Slack alert', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Slack alert failed',
          lastBlock,
          chainTip,
          lag,
        },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({
    success: true,
    lastBlock,
    chainTip,
    lag,
    threshold: lagThresholdBlocks,
    alerted: alerted || undefined,
  })
}
