import { blockscoutAddress } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import { ethers } from 'ethers'

//event NewAllocation(address indexed backer_, address indexed gauge_, uint256 allocation_)
const NEW_ALLOCATION_EVENT = ethers.id('NewAllocation(address,address,uint256)')

export const fetchNewAllocationEventByAddress = async (
  address: string,
  toBlockArg: bigint,
  fromBlock = BigInt(0),
) => {
  try {
    ;('use server')
    const logs = await axiosInstance.get(
      `${blockscoutAddress}?module=logs&action=getLogs&fromBlock=${
        fromBlock
      }&toBlock=${toBlockArg.toString()}&address=${BackersManagerAddress.toLowerCase()}&topic0=${
        NEW_ALLOCATION_EVENT
      }&topic1=${ethers.zeroPadValue(address.toLowerCase(), 32)}&topic0_1_opr=and`,
    )

    return logs.data.result
  } catch (err) {
    console.log('fetchVoteCastByAddress ERROR', err)
  }
}
