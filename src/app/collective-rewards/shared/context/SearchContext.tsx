import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useMemo, useState } from 'react'

type StateWithUpdate<T> = {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}

type SearchContextValue = {
  getValues: <T>() => T[]
  search: StateWithUpdate<string>
  filterBy: StateWithUpdate<string>
}

export const SearchContext = createContext<SearchContextValue>({
  getValues: () => [],
  search: {
    value: '',
    onChange: () => {},
  },
  filterBy: {
    value: '',
    onChange: () => {},
  },
})

type SearchValue = { builderName: string; address: string; builderStatus?: string }
type SearchProviderProps = {
  children: ReactNode
  builders: SearchValue[]
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())
export const SearchContextProvider: FC<SearchProviderProps> = ({ children, builders }) => {
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  const data = useMemo(() => {
    let filteredBuilders = builders

    if (search) {
      filteredBuilders = filteredBuilders.filter(
        ({ builderName, address }) =>
          // TODO: Here we filter by both name and address,
          // but the address is not displayed in the UI when the Builder name is present.
          lowerCaseCompare(builderName, search) || lowerCaseCompare(address, search),
      )
    }

    if (filterBy !== 'all') {
      filteredBuilders = filteredBuilders.filter(builder => builder.builderStatus === filterBy)
    }

    return filteredBuilders
  }, [builders, search, filterBy])

  const getValues = <T,>() => data as T[]

  const valueOfContext: SearchContextValue = {
    getValues,
    search: { value: search, onChange: setSearch },
    filterBy: { value: filterBy, onChange: setFilterBy },
  }

  return <SearchContext.Provider value={valueOfContext}>{children}</SearchContext.Provider>
}

export const useSearchContext = () => useContext(SearchContext)
