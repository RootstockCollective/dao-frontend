import {
  Context,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

type StateWithUpdate<T> = {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}

type SearchContextValue<Type> = {
  data: Type[]
  search: StateWithUpdate<string>
  filterBy: StateWithUpdate<string>
}

type SearchValue = { builderName: string; address: string }
export const SearchContext = createContext<SearchContextValue<SearchValue>>({
  data: [],
  search: {
    value: '',
    onChange: () => {},
  },
  filterBy: {
    value: '',
    onChange: () => {},
  },
})

type SearchProviderProps<T> = {
  children: ReactNode
  builders: T[]
  filterFunction?: (param: T, status: string) => boolean
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())
export const SearchContextProvider = <T extends SearchValue>({
  children,
  builders,
  filterFunction,
}: SearchProviderProps<T>) => {
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

    if (filterBy !== 'all' && filterFunction) {
      filteredBuilders = filteredBuilders.filter(builder => filterFunction(builder, filterBy))
    }

    return filteredBuilders
  }, [builders, search, filterBy])

  const valueOfContext: SearchContextValue<T> = {
    data,
    search: { value: search, onChange: setSearch },
    filterBy: { value: filterBy, onChange: setFilterBy },
  }

  return <SearchContext.Provider value={valueOfContext}>{children}</SearchContext.Provider>
}

export const useSearchContext = <T extends SearchValue>() =>
  useContext(SearchContext as unknown as Context<SearchContextValue<T>>)
