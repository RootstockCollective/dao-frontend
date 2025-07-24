import { axiosInstance } from '@/lib/utils'
import { fetchNFTsOwnedByAddressAndNftAddress, getNftInfo } from '@/lib/endpoints'

// Fetch NFTs owned by address
/*
 Expected response:
 [
    {
        "owner": "0xA1B1201B1f6EF7a5D589feD4E2cC4441276156B1",
        "token": {
            "address": "0xa3076bcaCc7112B7fa7c5A87CF32275296d85D64",
            "holders": 23,
            "totalSupply": 23,
            "name": "RIF DAO Early Adopters",
            "symbol": "RDEA",
            "type": "ERC-721",
            "iconUrl": null
        },
        "animationUrl": null,
        "externalAppUrl": "https://dapp.testnet.dao.rif.technology/",
        "id": "3",
        "imageUrl": "https://ipfs.io/ipfs/QmWKQETSTakBUGtLS4VtpYrk2siemgDvGQUmJewWV1XHSJ",
        "isUnique": true,
        "metadata": {
            "creator": "Rootstock Labs",
            "description": "Navigating through the vast networks, EchoNaut is a beacon of futuristic progress and digital exploration.",
            "external_url": "https://dapp.testnet.dao.rif.technology/",
            "image": "ipfs://QmWKQETSTakBUGtLS4VtpYrk2siemgDvGQUmJewWV1XHSJ",
            "name": "EchoNaut"
        }
    }
]

OR

[] (empty array)
*/
export const fetchNftsOwnedByAddressAndNFTAddress = (address: string, nftAddress: string) =>
  axiosInstance
    .get<{}>(
      fetchNFTsOwnedByAddressAndNftAddress
        .replace('{{address}}', address)
        .replace('{{nftAddress}}', nftAddress),
    )
    .then(({ data }) => data)
    .catch(error => console.log(error))

export const fetchNftInfo = (address: string) =>
  axiosInstance.get(getNftInfo.replace('{{nftAddress}}', address))
