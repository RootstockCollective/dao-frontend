// Usage: http://localhost:3000/api/mocks/fetchAddressTokensEndpoint?address=0x123&chainId=1
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, chainId } = req.query;

  res.status(200).json({
    message: "Mock response for fetching address tokens",
    tokens: [
      { token: 'token1', chainId },
      { token: 'token2', chainId },
      { token: 'token3', chainId },
    ],
    address,
    chainId,
  });
}
