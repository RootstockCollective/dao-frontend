import { FC } from 'react'

interface Props {
  children: string
}

export const Headline: FC<Props> = ({ children }) => {
  return <h1 className={'font-kk-topo text-[80px] text-center font-weight-[400] uppercase'}>{children}</h1>
}
