import { NFT_BOOSTER_DATA_URL } from '@/lib/constants'

export const fetchLatestFile = async (noCacheTime: number) => {
  const response = await fetch(`${NFT_BOOSTER_DATA_URL}/latest?nocache=${noCacheTime}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.text()
}

export const fetchBoostData = async (latestFile: string | undefined, noCacheTime: number) => {
  const response = await fetch(`${NFT_BOOSTER_DATA_URL}/${latestFile}?nocache=${noCacheTime}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return { ...data, nftContractAddress: data.nftContractAddress.toLowerCase() }
}
