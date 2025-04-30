import { NFT_BOOSTER_DATA_URL } from '@/lib/constants'
import { axiosInstance } from './BoosterContext'

export const fetchLatestFile = async (noCacheTime: number) => {
  const { data } = await axiosInstance.get(`${NFT_BOOSTER_DATA_URL}/latest?nocache=${noCacheTime}`)

  return data
}

export const fetchBoostData = async (latestFile: string | undefined, noCacheTime: number) => {
  const { data } = await axiosInstance.get(`${NFT_BOOSTER_DATA_URL}/${latestFile}?nocache=${noCacheTime}`)

  return { ...data, nftContractAddress: data.nftContractAddress.toLowerCase() }
}
