// Usage: http://localhost:3000/api/mocks/fetchProposalsCreatedByGovernorAddress?address=0x1234567890&topic0=0x1234567890
import { NextApiRequest, NextApiResponse } from 'next'
import reward_distributed from './topic_responses/reward_distributed'
import proposals from './topic_responses/proposals'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, topic0 } = req.query as { address: string; topic0: string }

  const eventsByTopic: { [key: string]: Array<any> } = {
    '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0': proposals(address),
    '0x57ea5c7c295b52ef3b06c69661d59c8a6d9c602ac5355cfe5e54e303c139f270': reward_distributed(address),
  }

  res.status(200).json(eventsByTopic[topic0])
}
