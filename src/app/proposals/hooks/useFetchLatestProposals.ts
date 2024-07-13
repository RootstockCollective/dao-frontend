import { useProposal } from '@/app/proposals/hooks/useProposal'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { useReadContracts } from 'wagmi'
import { useMemo } from 'react'

const fetchProposalByIndexContractConfig = (index: bigint) => ({
  abi: GovernorAbi,
  address: GovernorAddress,
  functionName: 'proposalDetailsAt',
  args: [index],
})

type ItemReturned = [bigint, [string], [bigint], [string], string]

const mapProposalArrayToObject = (item?: ItemReturned) => {
  if (!item) return {}
  return {
    proposalId: item[0],
    targets: item[1],
    values: item[2],
    calldatas: item[3],
    descriptionHash: item[4],
  }
}

export const useFetchLatestProposals = () => {
  const { primitiveProposalCount } = useProposal()

  const contractsToUse = useMemo(() => {
    let arrayToReturn: ReturnType<typeof fetchProposalByIndexContractConfig>[] = []
    const currentProposalCount = primitiveProposalCount as bigint
    if (currentProposalCount > 0) {
      const breakCounterOn = currentProposalCount - BigInt(5)
      let currentCounter = currentProposalCount
      while (currentCounter > breakCounterOn && currentCounter > 0) {
        currentCounter -= BigInt(1)
        arrayToReturn.push(fetchProposalByIndexContractConfig(currentCounter))
      }
    }
    return arrayToReturn
  }, [primitiveProposalCount])
  const { data: latestProposalsData, isLoading } = useReadContracts({
    contracts: contractsToUse,
  })
  const latestProposals = useMemo(
    () => latestProposalsData?.map(({ result }) => mapProposalArrayToObject(result)),
    [latestProposalsData],
  )
  return { latestProposals, isLoading }
}
