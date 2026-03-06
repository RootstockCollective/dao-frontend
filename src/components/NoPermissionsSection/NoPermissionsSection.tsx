'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/Button'
import { DisconnectIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface NoPermissionsSectionProps {
  className?: string
  'data-testid'?: string
}

export const NoPermissionsSection = ({ className, 'data-testid': dataTestId }: NoPermissionsSectionProps) => {
  const router = useRouter()

  return (
    <div
      className={cn('flex flex-col justify-center items-center py-20 px-6 bg-bg-80', className)}
      data-testid={dataTestId}
    >
      <div className="mb-6">
        <DisconnectIcon size={88} fill="#37322F" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <Paragraph bold className="text-v3-text-100 mt-1">
          Insufficient permissions
        </Paragraph>
        <Paragraph className="text-v3-text-60 text-center mb-6">
          The connected wallet does not have the required permissions to access this page.
        </Paragraph>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </div>
    </div>
  )
}
