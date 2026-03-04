'use client'

import { Header, Paragraph } from '@/components/Typography'

export const RequestHistoryPage = () => {
  return (
    <div
      data-testid="btc-vault-request-history"
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <Header variant="h3" caps className="text-100">
        Request history
      </Header>
      <Paragraph variant="body-l" className="text-bg-0">
        Your request history will appear here.
      </Paragraph>
    </div>
  )
}
