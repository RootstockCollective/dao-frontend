import { ethers } from 'ethers'
import { fetchVoteCastEventByAccountAddress } from '@/app/user/Balances/actions'

export const fetchVoteCastByAddress = async (address: string) => {
  try {
    const logs = await fetchVoteCastEventByAccountAddress(ethers.zeroPadValue(address, 32))

    return logs.data
  } catch (err) {
    console.log('fetchVoteCastByAddress ERROR', err)
  }
}
