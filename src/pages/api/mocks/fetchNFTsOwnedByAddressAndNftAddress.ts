// Usage: http://localhost:3000/api/mocks/fetchNFTsOwnedByAddressAndNftAddress?address=0x123&nftAddress=0x456
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, nftAddress } = req.query;

  res.status(200).json({
    message: "Mock response for fetching NFTs owned by address",
    nfts: [
      { nft: 'nft1', nftAddress },
      { nft: 'nft2', nftAddress },
      { nft: 'nft3', nftAddress },
    ],
    ownerAddress: address,
    nftAddress,
  });
}
