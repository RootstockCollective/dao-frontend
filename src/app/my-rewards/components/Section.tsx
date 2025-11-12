import { ReactNode } from 'react'

export const Section = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col w-full items-start gap-3 self-stretch pt-8 md:pt-10 pb-8 md:pb-10 pl-4 md:pl-6 pr-4 md:pr-6 bg-v3-bg-accent-80 rounded">
      {children}
    </div>
  )
}
