import { createContext, FC, ReactNode, useContext, useState } from 'react'

type HeroCollapseContextType = {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}
const HeroCollapseContext = createContext<HeroCollapseContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

type HeroCollapseProviderProps = {
  children: ReactNode
}
export const HeroCollapseProvider: FC<HeroCollapseProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const valueOfContext: HeroCollapseContextType = {
    isCollapsed,
    setIsCollapsed,
  }

  return <HeroCollapseContext.Provider value={valueOfContext}>{children}</HeroCollapseContext.Provider>
}

export const useCollapseContext = () => useContext(HeroCollapseContext)
