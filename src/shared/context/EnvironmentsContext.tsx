import { useQuery } from '@tanstack/react-query'
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Address, zeroAddress } from 'viem'
import { AVERAGE_BLOCKTIME, CR_MIGRATING } from '@/lib/constants'
import { readContract } from '@wagmi/core'
import { config } from '@/config'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress, BuilderRegistryAddress, RewardDistributorAddress } from '@/lib/contracts'

type EnvironmentsContextType = {
  backersManagerAddress: Address
  builderRegistryAddress: Address
  rewardDistributorAddress: Address
}
const EnvironmentsContext = createContext<EnvironmentsContextType>({
  backersManagerAddress: zeroAddress,
  builderRegistryAddress: zeroAddress,
  rewardDistributorAddress: zeroAddress,
})

type EnvironmentsProviderProps = {
  children: ReactNode
}
export const EnvironmentsProvider: FC<EnvironmentsProviderProps> = ({ children }) => {
  const [builderRegistryAddress, setBuilderRegistryAddress] = useState<Address>(BackersManagerAddress)

  useBuilderRegistryMigration(setBuilderRegistryAddress)

  const valueOfContext: EnvironmentsContextType = {
    backersManagerAddress: BackersManagerAddress,
    builderRegistryAddress,
    rewardDistributorAddress: RewardDistributorAddress,
  }

  return <EnvironmentsContext.Provider value={valueOfContext}>{children}</EnvironmentsContext.Provider>
}

const useBuilderRegistryMigration = (setBuilderRegistryAddress: Dispatch<SetStateAction<Address>>) => {
  const [migrated, setMigrated] = useState(false)

  const { data: validation } = useQuery({
    queryFn: async () => {
      const gaugesLength = await readContract(config, {
        address: BuilderRegistryAddress,
        abi: BuilderRegistryAbi,
        functionName: 'getGaugesLength',
      })

      return gaugesLength > 0
    },
    queryKey: ['builderRegistryMigration'],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: false,
    enabled: CR_MIGRATING && !migrated && BuilderRegistryAddress != zeroAddress,
  })

  useEffect(() => {
    if (validation) {
      setBuilderRegistryAddress(BuilderRegistryAddress)
      setMigrated(true)
    }
  }, [setBuilderRegistryAddress, validation])
}

export const useEnvironmentsContext = () => useContext(EnvironmentsContext)
