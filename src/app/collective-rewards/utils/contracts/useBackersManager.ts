import { BackersManagerAbi } from '@/lib/abis/v2'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'
import { useReadContract, UseReadContractReturnType, type UseReadContractParameters } from 'wagmi'
import {
  useResponsibleWriteContract,
  UseResponsibleWriteContractParameters,
} from './useResponsibleWriteContract'

export const useBackersManagerWrite = (params: UseResponsibleWriteContractParameters) => {
  return useResponsibleWriteContract(params)
}

export type UseReadBackersManagerParameters = Omit<UseReadContractParameters, 'abi' | 'address'>

export const useReadBackersManager = (params: UseReadBackersManagerParameters): UseReadContractReturnType => {
  const result = useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    ...params,
  })

  return useMemo(() => {
    return result
  }, [result])
}
