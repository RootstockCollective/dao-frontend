// Usage: http://localhost:3000/api/mocks/fetchPricesEndpoint?address=0x123&chainId=1
import { NextApiRequest, NextApiResponse } from 'next'
import { zeroAddress } from 'viem'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { addresses, convert } = req.query

  if (!addresses) {
    return res.status(400).json({
      // eslint-disable-next-line quotes
      error: "Missing required parameter 'addresses'",
    })
  }

  res.status(200).json(
    addresses
      .toString()
      .split(',')
      .reduce(
        (acc, address) => ({
          ...acc,
          [address]: {
            price: address === zeroAddress ? 59709.08531329423 : 0.07601445824978191,
            lastUpdated: '2024-08-12T11:51:00.000Z',
          },
        }),
        {},
      ),
  )
}
