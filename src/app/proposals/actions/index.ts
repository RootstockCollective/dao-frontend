import { governor } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import { ethers } from 'ethers'

const CAST_VOTE_EVENT = ethers.id('VoteCast(address,uint256,uint8,uint256,string)')

export const fetchVoteCastByAddress = async (address: string, toBlockArg: bigint, fromBlock = BigInt(0)) => {
  console.log('toBlockArg', toBlockArg)
  try {
    ;('use server')
    const logs = await axiosInstance.get(
      `https://rootstock-testnet.blockscout.com/api?module=logs&action=getLogs&fromBlock=${
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
