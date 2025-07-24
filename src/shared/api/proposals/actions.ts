import { axiosInstance } from '@/lib/utils'
import { fetchProposalsCreatedByGovernorAddress, fetchVoteCastEventEndpoint } from '@/lib/endpoints'
import { GovernorAddress } from '@/lib/contracts'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'
import { Address, padHex } from 'viem'

export const fetchProposalCreated = (fromBlock = 0) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchProposalsCreatedByGovernorAddress
      .replace('{{address}}', GovernorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )

export const fetchVoteCastEventByAccountAddress = (address: Address) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchVoteCastEventEndpoint
      .replace('{{address}}', GovernorAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )

export const fetchProposalsCreatedCached = () => axiosInstance.get('/proposals/api', { baseURL: '/' })
