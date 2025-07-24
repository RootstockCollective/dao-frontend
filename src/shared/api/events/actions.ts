import { axiosInstance } from '@/lib/utils'
import { fetchNewAllocationEventEndpoint } from '@/lib/endpoints'
import { BackersManagerAddress } from '@/lib/contracts'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'
import { Address, padHex } from 'viem'

export const fetchNewAllocationEventByAccountAddress = (address: Address) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchNewAllocationEventEndpoint
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )
