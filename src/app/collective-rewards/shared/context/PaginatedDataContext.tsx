import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, FC, useContext, useMemo, useState } from 'react'

type PaginationConfig<T> = {
  data: T[]
  pageSize: number
  currentPage: number
}

type State<T extends Object = {}> = PaginationConfig<T> & {
  pageCount: number
}

type Actions<T extends Object = {}> = {
  getDataIndex: (index: number) => number
  getPage: (page?: number) => T[]
  updateData: (data: T[]) => void
  updatePageSize: (pageSize: number) => void
  updateCurrentPage: (currentPage: number) => void
}

type PageContext<T extends Object = {}> = State<T> & Actions<T>

export const PaginatedDataContext = createContext<PageContext<any>>({
  data: [],
  pageSize: 0,
  currentPage: 0,
  pageCount: 0,
  getDataIndex: () => 0,
  getPage: () => [],
  updateData: () => {},
  updatePageSize: () => {},
  updateCurrentPage: () => {},
})

export const usePaginatedDataContext = <T extends Object = {}>() => {
  const context = useContext<PageContext<T>>(PaginatedDataContext)
  if (!context) {
    throw new NoContextProviderError('usePaginatedDataContext', 'PaginatedDataContextProvider')
  }
  return context
}

type PaginatedDataContextProviderProps<T extends Object = {}> = {
  children: React.ReactNode
  config: PaginationConfig<T>
}

export const PaginatedDataContextProvider: FC<PaginatedDataContextProviderProps> = ({ children, config }) => {
  const [data, setData] = useState(config.data)
  const [pageSize, setPageSize] = useState(config.pageSize)
  const [currentPage, setCurrentPage] = useState(config.currentPage)

  const state = {
    data,
    pageSize,
    currentPage,
    pageCount: useMemo(() => Math.ceil(data.length / pageSize), [data, pageSize]),
  }
  const actions = {
    getDataIndex: (pagedIndex: number) => pagedIndex + pageSize * currentPage,
    getPage: (page?: number) => {
      const pageIndex = page ?? currentPage
      const start = pageIndex * pageSize
      const end = start + pageSize

      return data.slice(start, end)
    },
    updateData: (newData: typeof data) => setData(newData),
    updatePageSize: (newPageSize: number) => setPageSize(newPageSize),
    updateCurrentPage: (newCurrentPage: number) => setCurrentPage(newCurrentPage),
  }

  return (
    <PaginatedDataContext.Provider value={{ ...state, ...actions }}>{children}</PaginatedDataContext.Provider>
  )
}

export const withPagination = <T extends Object = {}, TProps extends Object = {}>(Component: FC<TProps>) => {
  const PaginatedComponent: FC<
    PaginationConfig<T> & {
      props: TProps
    }
  > = ({ props, ...rest }) => {
    return (
      <PaginatedDataContextProvider config={{ ...rest }}>
        <Component {...props} />
      </PaginatedDataContextProvider>
    )
  }
  return PaginatedComponent
}
