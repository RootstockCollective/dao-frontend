import { governor } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import { ethers } from 'ethers'

const BLOCKSCOUT_URL = process.env.NEXT_PUBLIC_BLOCKSCOUT
const CAST_VOTE_EVENT = ethers.id('VoteCast(address,uint256,uint8,uint256,string)')

export const fetchVoteCastByAddress = async (
  address: string,
  toBlockArg: BigInt | 'latest' = 'latest',
  fromBlock = BigInt(0),
) => {
  'use server'
  try {
    const logs = await axiosInstance.get(
      `${BLOCKSCOUT_URL}?module=logs&action=getLogs&fromBlock=${
        fromBlock
      }&toBlock=${toBlockArg.toString()}&address=${governor.address}&topic0=${
        CAST_VOTE_EVENT
      }&topic1=${ethers.zeroPadValue(address, 32)}&topic0_1_opr=and`,
    )

    return logs.data.result
  } catch (err) {
    console.log('fetchVoteCastByAddress ERROR', err)
  }
}
