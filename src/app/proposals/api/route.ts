import { fetchProposalCreated } from '@/app/user/Balances/actions'

export const revalidate = 25

// @TODO remove and use /api/proposals/v1
export async function GET() {
  const { data } = await fetchProposalCreated()
  data.sort((a, b) => {
    const diff = BigInt(b.blockNumber ?? '0x0') - BigInt(a.blockNumber ?? '0x0')
    return diff > 0n ? 1 : diff < 0n ? -1 : 0
  })
  return Response.json(data)
}
