'use client'
import { useAlertContext } from '@/app/providers'
import { Footer } from '@/components/Footer'
import { PageHeader } from '@/app/_user-connection/PageHeader'
import { StatefulSidebar } from '@/components/MainContainer/StatefulSidebar'
import { FC, ReactNode, Suspense } from 'react'
import { Alert } from '../Alert'
import { MainContainerContent } from './MainContainerContent'
import { GradientHeader } from '@/components/GradientHeader/GradientHeader'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => {
  const { message, setMessage } = useAlertContext()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradientHeader />
      <div className="flex h-screen">
        <StatefulSidebar />
        <div className="flex flex-1 flex-col justify-between overflow-y-auto mt-10 ml-72">
          <main className="px-[32px] py-[34px] mb-[100px]">
            {message && (
              <Alert {...message} onDismiss={message.onDismiss === null ? null : () => setMessage(null)} />
            )}
            <PageHeader />
            <MainContainerContent setMessage={setMessage}>{children}</MainContainerContent>
          </main>
          <Footer variant="container" />
        </div>
      </div>
    </Suspense>
  )
}
