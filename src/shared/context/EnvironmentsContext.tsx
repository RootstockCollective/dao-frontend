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
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress, BuilderRegistryAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

type EnvironmentsContextType = {
  backersManagerAddress: Address
  builderRegistryAddress: Address | undefined
}
const EnvironmentsContext = createContext<EnvironmentsContextType>({
  backersManagerAddress: BackersManagerAddress,
  builderRegistryAddress: undefined,
})

type EnvironmentsProviderProps = {
  children: ReactNode
}
export const EnvironmentsProvider: FC<EnvironmentsProviderProps> = ({ children }) => {
  const [builderRegistryAddress, setBuilderRegistryAddress] = useState<Address | undefined>()

  useBuilderRegistryMigration(setBuilderRegistryAddress)

  const valueOfContext: EnvironmentsContextType = {
    backersManagerAddress: BackersManagerAddress,
    builderRegistryAddress,
  }

  return <EnvironmentsContext.Provider value={valueOfContext}>{children}</EnvironmentsContext.Provider>
}

const useBuilderRegistryMigration = (
  setBuilderRegistryAddress: Dispatch<SetStateAction<Address | undefined>>,
) => {
  const [migrated, setMigrated] = useState(false)

  const { data: gaugesLength } = useReadContract({
    address: BuilderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'getGaugesLength',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: CR_MIGRATING && !migrated && BuilderRegistryAddress !== zeroAddress,
    },
  })

  useEffect(() => {
    if (!CR_MIGRATING || BuilderRegistryAddress === zeroAddress) {
      setBuilderRegistryAddress(BackersManagerAddress)
      return
    }

    if (gaugesLength !== undefined) {
      if (gaugesLength > 0n) {
        setBuilderRegistryAddress(BuilderRegistryAddress)
        setMigrated(true)
      } else {
        setBuilderRegistryAddress(BackersManagerAddress)
      }
    }
  }, [gaugesLength, setBuilderRegistryAddress])
}

export const useEnvironmentsContext = () => useContext(EnvironmentsContext)
