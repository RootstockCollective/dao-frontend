'use client'
import { Header } from '@/components/Header'
import { FC, ReactNode } from 'react'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => (
  <div className='flex'>
    <StatefulSidebar />
    <div className='flex-auto'>
      {/* @TODO Create stateful header that will contain address and short address and disconnect event */}
      <Header address={''} shortAddress={'asd'} />
      {children}
    </div>
  </div>
)
